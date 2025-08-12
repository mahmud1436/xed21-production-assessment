import { Router } from 'express';
import { storage } from '../storage';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { createRazorpayOrder, verifyRazorpaySignature, calculateCoins } from '../services/payment';
import { rechargeSchema } from '@shared/schema';

const router = Router();

// Create Razorpay order for wallet recharge
router.post('/create-order', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const validation = rechargeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        details: validation.error.errors
      });
    }

    const { amount } = validation.data;
    const userId = req.user!.id;

    const orderResult = await createRazorpayOrder(amount, userId);
    
    if (!orderResult.success) {
      return res.status(400).json({
        success: false,
        error: orderResult.error
      });
    }

    res.json({
      success: true,
      order: orderResult.order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
});

// Verify payment and add coins to wallet
router.post('/verify-payment', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment details'
      });
    }

    // Verify payment signature
    const isValidSignature = verifyRazorpaySignature({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    });

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate coins and bonus
    const totalCoins = await calculateCoins(amount, userId, storage);
    const totalUsers = await storage.getTotalUserCount();
    const isIntroOffer = totalUsers <= 1000 && user && !user.hasUsedIntroOffer;
    const conversionRate = isIntroOffer ? 2 : 1;
    const baseCoins = amount * conversionRate;
    const bonusCoins = totalCoins - baseCoins;

    // Mark intro offer as used if applicable
    if (isIntroOffer) {
      await storage.markUserIntroOfferUsed(userId);
    }

    // Update user balance
    const newBalance = user.coins + totalCoins;
    await storage.updateUserCoins(userId, newBalance);

    // Record transaction
    await storage.createWalletTransaction({
      userId,
      type: 'credit',
      amount: baseCoins,
      description: `Wallet recharge of ₹${amount}`,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });

    // Record bonus transaction if applicable
    if (bonusCoins > 0) {
      await storage.createWalletTransaction({
        userId,
        type: 'bonus',
        amount: bonusCoins,
        description: `Bonus coins for ₹${amount} recharge`,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id
      });
    }

    res.json({
      success: true,
      newBalance,
      coinsAdded: totalCoins,
      bonusCoins
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

// Get wallet transactions
router.get('/transactions', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const transactions = await storage.getUserTransactions(userId);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

export default router;