import { Router } from 'express';
import authRoutes  from './auth.routes.js';
import taskRoutes  from './task.routes.js';
import userRoutes  from './user.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth',  authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;