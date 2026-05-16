import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const updateProfileSchema = z.object({
  username: z.string().min(3).max(20)
    .regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(300).optional(),
  avatar: z.string().url().optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
    .regex(/[A-Z]/, 'Need uppercase')
    .regex(/[0-9]/, 'Need number'),
});

router.get('/profile',  userController.getProfile);
router.patch('/profile', validate('body', updateProfileSchema), userController.updateProfile);
router.patch('/password', validate('body', changePasswordSchema), userController.changePassword);
router.get('/activity', userController.getActivity);

export default router;