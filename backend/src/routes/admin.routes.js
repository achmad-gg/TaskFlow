import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Both middlewares run on every admin route
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/stats',         adminController.getPlatformStats);
router.get('/users',         adminController.getUsers);
router.patch('/users/:id/toggle', adminController.toggleUser);

export default router;