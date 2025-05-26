import { Router } from 'express';
import passport from 'passport';
import authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback
);

// Protected routes
router.get('/me', requireAuth, authController.getCurrentUser);
router.post('/logout', requireAuth, authController.logout);
router.get('/check', authController.checkAuth);

export default router; 