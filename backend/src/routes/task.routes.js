import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validators/task.validator.js';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Stats must come BEFORE /:id to avoid Express matching 'stats' as an id param
router.get('/stats', taskController.getStats);

router.get('/',    validate('query', taskQuerySchema), taskController.getTasks);
router.post('/',   validate('body', createTaskSchema),  taskController.createTask);
router.get('/:id',    taskController.getTask);
router.patch('/:id',  validate('body', updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;