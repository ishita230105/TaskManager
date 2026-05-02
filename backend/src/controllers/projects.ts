import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { projectSchema } from '../schemas';

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: req.user!.userId,
        members: {
            create: {
                userId: req.user!.userId,
                role: 'ADMIN' // Creator is inherently an admin of the project
            }
        }
      },
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const projects = await prisma.project.findMany({
      skip,
      take: limit,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { role: true, user: { select: { name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
      next(error);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: {
        owner: { select: { id: true, name: true } },
        members: { select: { role: true, user: { select: { id: true, name: true, email: true } } } },
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
  } catch(error) {
      next(error);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
