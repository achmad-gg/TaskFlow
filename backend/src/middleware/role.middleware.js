import { AppError } from './error.middleware.js';

// Factory function — returns middleware configured for specific roles
// Usage: requireRole('ADMIN') or requireRole('ADMIN', 'MODERATOR')
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};