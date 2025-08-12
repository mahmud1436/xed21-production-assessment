import { Router } from 'express';
import { storage } from '../storage';
import { AuthRequest, authenticateUser } from '../middleware/auth';

const router = Router();

// Get user profile (with updated coin balance)
router.get('/profile', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's question generation history
router.get('/question-history', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const questionSets = await storage.getUserQuestionSets(userId);

    res.json({
      success: true,
      questionSets
    });
  } catch (error) {
    console.error('Question history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch question history'
    });
  }
});

export default router;