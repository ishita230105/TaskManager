import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { createProject, getProjects, getProjectById, deleteProject } from '../controllers/projects';

const router = Router();

router.use(authenticate);

router.post('/', requireAdmin, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.delete('/:id', requireAdmin, deleteProject);

export default router;
