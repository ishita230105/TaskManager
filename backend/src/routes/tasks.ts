import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { createTask, getTasks, updateTaskStatus, deleteTask } from '../controllers/tasks';

const router = Router();

router.use(authenticate);

router.post('/', requireAdmin, createTask);
router.get('/', getTasks);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', requireAdmin, deleteTask);

export default router;
