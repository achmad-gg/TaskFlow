import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils.js';
import { logActivity } from './activity.service.js';
import { ACTIVITY_TYPES } from '../config/constants.js';
import { env } from '../config/env.js';

export const registerUser = async ({ email, username, password }) => {
  // Check for existing user
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    throw new AppError(
      existing.email === email ? 'Email already in use' : 'Username already taken',
      409
    );
  }

  // Hash password — never store plaintext
  // Why bcrypt: slow by design (prevents brute force), salted (prevents rainbow tables)
  // Cost factor 12 means ~250ms per hash — acceptable UX, painful for attackers
  const passwordHash = await bcrypt.hash(password, parseInt(env.BCRYPT_ROUNDS));

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  await logActivity(user.id, ACTIVITY_TYPES.USER_REGISTERED);

  return user;
};

export const loginUser = async ({ email, password }) => {
  // Use a generic error message — don't reveal whether email or password is wrong
  // "Email not found" tells attackers which emails are registered (enumeration attack)
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token pair
  const tokenPayload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store hashed refresh token (if stolen, hash can't be reversed)
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken: hashedRefreshToken,
      lastLoginAt: new Date(),
    },
  });

  await logActivity(user.id, ACTIVITY_TYPES.USER_LOGGED_IN);

  const userProfile = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar: user.avatar,
  };

  return { accessToken, refreshToken, user: userProfile };
};

export const logoutUser = async (userId) => {
  // Invalidate refresh token in DB
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

export const refreshTokens = async (refreshToken) => {
  const { verifyRefreshToken } = await import('../utils/jwt.utils.js');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || !user.refreshToken || !user.isActive) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Verify the stored hashed refresh token matches
  const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isValid) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Token rotation — issue new pair, invalidate old refresh token
  const tokenPayload = { userId: user.id, role: user.role };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);
  const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedNewRefreshToken },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};