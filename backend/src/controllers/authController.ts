import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AuthController {
  // Initiate Google OAuth
  googleAuth(req: Request, res: Response) {
    // This will be handled by passport middleware
  }

  // Google OAuth callback
  googleCallback(req: AuthenticatedRequest, res: Response) {
    if (req.user) {
      // Successful authentication
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } else {
      // Authentication failed
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }

  // Get current user
  getCurrentUser(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in to access this resource',
      });
    }

    res.json({
      success: true,
      user: req.user,
    });
  }

  // Logout
  logout(req: AuthenticatedRequest, res: Response) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          error: 'Logout failed',
          message: 'An error occurred during logout',
        });
      }
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            error: 'Session cleanup failed',
            message: 'An error occurred during session cleanup',
          });
        }
        
        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Logged out successfully',
        });
      });
    });
  }

  // Check authentication status
  checkAuth(req: AuthenticatedRequest, res: Response) {
    res.json({
      authenticated: req.isAuthenticated(),
      user: req.user || null,
    });
  }
}

export default new AuthController(); 