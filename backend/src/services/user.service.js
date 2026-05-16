import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { env } from '../config/env.js';

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
      lastLoginAt: true,
      _count: { select: { tasks: true } },
    },
  });

  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateProfile = async (userId, data) => {
  // Prevent email/username conflicts with other users
  if (data.username) {
    const conflict = await prisma.user.findFirst({
      where: {
        username: data.username,
        NOT: { id: userId },
      },
    });
    if (conflict) throw new AppError('Username already taken', 409);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, email: true, username: true,
      avatar: true, bio: true, role: true,
    },
  });
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new AppError('Current password is incorrect', 400);

  if (currentPassword === newPassword) {
    throw new AppError('New password must differ from current password', 400);
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    parseInt(env.BCRYPT_ROUNDS)
  );

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, refreshToken: null }, // Invalidate all sessions
  });
};