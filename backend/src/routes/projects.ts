import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

// Create project (Admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: req.user!.userId,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const projects = await prisma.project.findMany({
    skip,
    take: limit,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(projects);
});

// Get single project
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id as string },
    include: {
      owner: { select: { id: true, name: true } },
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
      },
    },
  });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
});

// Delete project (Admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete project' });
  }
});

export default router;
