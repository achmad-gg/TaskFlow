// Controllers handle HTTP — they translate HTTP requests into service calls
// and HTTP responses. They contain no business logic.

import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.utils.js';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,        // JS cannot access — XSS protection
  secure: env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',   // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    sendSuccess(res, user, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.loginUser(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    // Access token can be returned in body or as a shorter-lived cookie
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    sendSuccess(res, { user, accessToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.user.id);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);

    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    sendSuccess(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    sendSuccess(res, req.user, 'Current user fetched');
  } catch (err) {
    next(err);
  }
};