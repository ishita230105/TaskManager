import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string(),
  assigneeId: z.string().optional(),
});

// Create task (Admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
      if (!assignee) {
        res.status(404).json({ error: 'Assignee not found' });
        return;
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Get all tasks (can filter by projectId)
router.get('/', async (req: AuthRequest, res: Response) => {
  const { projectId } = req.query;
  const whereClause = projectId ? { projectId: String(projectId) } : {};
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const tasks = await prisma.task.findMany({
    where: whereClause,
    skip,
    take: limit,
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(tasks);
});

const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});

// Update task status (Assignee or Admin)
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const data = updateTaskStatusSchema.parse(req.body);
    const taskId = req.params.id;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && task.assigneeId !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden: You can only update your own tasks' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: data.status },
    });
    
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Delete task (Admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete task' });
  }
});

export default router;
