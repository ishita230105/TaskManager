import { Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        assignedTasks: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedUsers = users.map(u => ({
      ...u,
      taskCount: u.assignedTasks.length
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('req.user:', req.user);
    const currentUser = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    console.log('currentUser:', currentUser);
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    
    const id = req.params.id as string;
    if (id === req.user!.userId) {
      res.status(400).json({ error: 'Cannot delete yourself' });
      return;
    }
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
