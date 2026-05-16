import prisma from '../config/database.js';
import { getPaginationParams } from '../utils/pagination.utils.js';

export const getAllUsers = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { search } = query;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, username: true,
        role: true, isActive: true, createdAt: true,
        lastLoginAt: true,
        _count: { select: { tasks: true } },
      },
    }),
  ]);

  return { users, total, page, limit };
};

export const toggleUserStatus = async (userId, adminId) => {
  if (userId === adminId) {
    const { AppError } = await import('../middleware/error.middleware.js');
    throw new AppError('Cannot deactivate your own account', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const { AppError } = await import('../middleware/error.middleware.js');
    throw new AppError('User not found', 404);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      isActive: !user.isActive,
      // Invalidate sessions when deactivating
      ...(!user.isActive ? {} : { refreshToken: null }),
    },
    select: {
      id: true, username: true, isActive: true,
    },
  });
};

export const getPlatformStats = async () => {
  const [
    totalUsers, activeUsers,
    totalTasks, tasksByStatus,
    newUsersThisWeek, tasksCompletedThisWeek,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.task.count(),
    prisma.task.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.task.count({
      where: {
        status: 'DONE',
        completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const statusMap = Object.fromEntries(
    tasksByStatus.map(s => [s.status, s._count.status])
  );

  return {
    users: { total: totalUsers, active: activeUsers },
    tasks: {
      total: totalTasks,
      todo: statusMap.TODO || 0,
      inProgress: statusMap.IN_PROGRESS || 0,
      done: statusMap.DONE || 0,
      cancelled: statusMap.CANCELLED || 0,
    },
    thisWeek: {
      newUsers: newUsersThisWeek,
      tasksCompleted: tasksCompletedThisWeek,
    },
  };
};