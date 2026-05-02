import { Router } from 'express';
import { getUsers, deleteUser } from '../controllers/users';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getUsers);
router.delete('/:id', deleteUser);

export default router;
