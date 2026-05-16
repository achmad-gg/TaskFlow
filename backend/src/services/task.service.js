import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { getPaginationParams } from '../utils/pagination.utils.js';
import { logActivity } from './activity.service.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

export const getTasks = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const {
    status, priority, search,
    sortBy = 'createdAt', sortOrder = 'desc',
    tags,
  } = query;

  // Build filter dynamically — only add conditions that are present
  const where = {
    userId,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(tags && {
      tags: { hasSome: tags.split(',').map(t => t.trim()) },
    }),
  };

  // Run count and data fetch in parallel — saves one round trip
  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
  ]);

  return { tasks, total, page, limit };
};

export const getTaskById = async (id, userId) => {
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task) throw new AppError('Task not found', 404);

  // Users can only access their own tasks
  if (task.userId !== userId) throw new AppError('Forbidden', 403);

  return task;
};

export const createTask = async (userId, data) => {
  const task = await prisma.task.create({
    data: { ...data, userId },
  });

  await logActivity(userId, ACTIVITY_TYPES.TASK_CREATED, {
    taskId: task.id,
    title: task.title,
  });

  return task;
};

export const updateTask = async (id, userId, data) => {
  // Verify ownership first
  const existing = await getTaskById(id, userId);

  // Track status changes for analytics
  const isStatusChange = data.status && data.status !== existing.status;

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      // Auto-set completedAt when marking done
      ...(data.status === 'DONE' && !existing.completedAt
        ? { completedAt: new Date() }
        : {}),
      // Clear completedAt if un-completing
      ...(data.status && data.status !== 'DONE'
        ? { completedAt: null }
        : {}),
    },
  });

  await logActivity(userId, isStatusChange
    ? ACTIVITY_TYPES.STATUS_CHANGED
    : ACTIVITY_TYPES.TASK_UPDATED,
    {
      taskId: task.id,
      title: task.title,
      ...(isStatusChange && {
        from: existing.status,
        to: data.status,
      }),
    }
  );

  return task;
};

export const deleteTask = async (id, userId) => {
  await getTaskById(id, userId); // Verify ownership

  await prisma.task.delete({ where: { id } });

  await logActivity(userId, ACTIVITY_TYPES.TASK_DELETED, { taskId: id });
};

export const getTaskStats = async (userId) => {
  // Single aggregation query — more efficient than multiple count queries
  const [statusCounts, priorityCounts, recentlyCompleted] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { userId },
      _count: { priority: true },
    }),
    prisma.task.count({
      where: {
        userId,
        status: 'DONE',
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  const byStatus = Object.fromEntries(
    statusCounts.map(s => [s.status, s._count.status])
  );

  const byPriority = Object.fromEntries(
    priorityCounts.map(p => [p.priority, p._count.priority])
  );

  return {
    total: Object.values(byStatus).reduce((a, b) => a + b, 0),
    todo: byStatus.TODO || 0,
    inProgress: byStatus.IN_PROGRESS || 0,
    done: byStatus.DONE || 0,
    cancelled: byStatus.CANCELLED || 0,
    urgent: byPriority.URGENT || 0,
    high: byPriority.HIGH || 0,
    medium: byPriority.MEDIUM || 0,
    low: byPriority.LOW || 0,
    completedThisWeek: recentlyCompleted,
  };
};