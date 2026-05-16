import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

// Activity logging is fire-and-forget — never let it block the main operation
export const logActivity = async (userId, type, metadata = null) => {
  try {
    await prisma.activityLog.create({
      data: { userId, type, metadata },
    });
  } catch (error) {
    // Log the logging failure but don't propagate it
    logger.error('Failed to log activity', { error: error.message, userId, type });
  }
};

export const getRecentActivity = async (userId, limit = 10) => {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      metadata: true,
      createdAt: true,
    },
  });
};