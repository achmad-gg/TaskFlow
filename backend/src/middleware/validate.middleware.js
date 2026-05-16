import { ZodError } from 'zod';

// Validation middleware factory using Zod schemas
// validate('body', schema) or validate('query', schema) or validate('params', schema)
export const validate = (target, schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[target]);
      // Express 5 makes req.query a read-only getter — store parsed result separately
      if (target === 'query') {
        req.validatedQuery = parsed;
      } else {
        req[target] = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: err.flatten().fieldErrors,
          timestamp: new Date().toISOString(),
        });
      }
      next(err);
    }
  };
};