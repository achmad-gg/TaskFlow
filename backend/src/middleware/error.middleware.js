// Centralized error handling — the single most important Express middleware.
// Without this, unhandled errors leak stack traces to users (security issue)
// and your error responses are inconsistent.

import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  // Always log the full error internally
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
      timestamp: new Date().toISOString(),
    });
  }

  // Prisma known errors (DB constraint violations, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      const field = err.meta?.target?.[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists`,
        timestamp: new Date().toISOString(),
      });
    }
    if (err.code === 'P2025') {
      // Record not found
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      timestamp: new Date().toISOString(),
    });
  }

  // Custom app errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Unknown errors — don't leak internals
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(isDev && { stack: err.stack }), // Only show stack in dev
    timestamp: new Date().toISOString(),
  });
};

// Custom operational error class
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;  // Distinguish from programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}