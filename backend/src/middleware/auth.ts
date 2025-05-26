import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    createdAt: Date;
  };
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource',
    });
  }
  next();
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // This middleware allows both authenticated and unauthenticated requests
  next();
}; 