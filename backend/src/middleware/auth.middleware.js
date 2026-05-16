import { verifyAccessToken } from '../utils/jwt.utils.js';
import { AppError } from './error.middleware.js';
import prisma from '../config/database.js';

// Why check DB on every request? 
// Tokens can't be revoked once issued (stateless). 
// Checking isActive lets us disable compromised accounts immediately.
// Tradeoff: one extra DB query per request. Mitigate with Redis caching in prod.

export const authenticate = async (req, res, next) => {
  try {
    // Support both httpOnly cookie (preferred) and Authorization header (for mobile/API clients)
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Account not found or deactivated', 401);
    }

    req.user = user; // Attach to request for downstream middleware/controllers
    next();
  } catch (err) {
    next(err);
  }
};