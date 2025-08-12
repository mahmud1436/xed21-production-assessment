import Razorpay from 'razorpay';

// Initialize Razorpay only if keys are provided
let razorpay: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export interface CreateOrderRequest {
  amount: number;
  userId: string;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export async function createRazorpayOrder(amount: number, userId: string) {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Payment service not configured. Please contact support.'
      };
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `ord_${userId.slice(-8)}_${Date.now().toString().slice(-8)}`, // Keep under 40 chars
      notes: {
        userId: userId
      }
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: 'Failed to create payment order'
    };
  }
}

export function verifyRazorpaySignature(payment: VerifyPaymentRequest): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`)
      .digest('hex');
    
    return expectedSignature === payment.razorpay_signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function calculateCoins(amount: number, userId: string, storage: any): Promise<number> {
  const user = await storage.getUser(userId);
  const totalUsers = await storage.getTotalUserCount();
  
  // Check if user is eligible for intro offer (first 1000 users and hasn't used it yet)
  const isIntroOfferEligible = totalUsers <= 1000 && user && !user.hasUsedIntroOffer;
  
  // Base conversion rate
  // Intro offer: ₹0.5 = 1 coin (₹1 = 2 coins)
  // Normal rate: ₹1 = 1 coin  
  const conversionRate = isIntroOfferEligible ? 2 : 1;
  let coins = amount * conversionRate;
  
  // Bonus coins for special packs and amounts (only for intro offer rate)
  if (isIntroOfferEligible) {
    if (amount === 500) {
      coins += 100; // ₹500 → 1100 coins (+100 bonus)
    } else if (amount === 1000) {
      coins += 300; // ₹1000 → 2300 coins (+300 bonus)
    } else if (amount > 1000) {
      // 18% bonus for recharges above ₹1000
      const bonusCoins = Math.floor(coins * 0.18);
      coins += bonusCoins;
    }
  }
  
  return coins;
}