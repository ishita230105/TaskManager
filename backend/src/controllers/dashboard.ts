import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalProjects,
      totalTasks,
      tasksByStatus,
      recentActiveTasks,
      overdueTasks
    ] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.task.findMany({
        where: {
          status: { in: ['TODO', 'IN_PROGRESS'] }
        },
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.task.findMany({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'DONE' }
        },
        include: { project: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5
      })
    ]);
    
    res.json({
      totalProjects,
      totalTasks,
      tasksByStatus,
      recentActiveTasks,
      overdueTasks
    });
  } catch (error) {
    next(error);
  }
};
