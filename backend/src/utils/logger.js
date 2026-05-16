// Winston gives you: log levels, file transport, JSON format for log aggregators
// Never use console.log in production — it has no levels and no structure

import winston from 'winston';
import { env } from '../config/env.js';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }), // Include stack traces on errors
    json()                    // JSON format for log aggregators
  ),
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'development'
        ? combine(colorize(), simple()) // Human-readable in dev
        : json()                        // Machine-readable in prod
    }),
    // In production, add file transports or a cloud transport
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});