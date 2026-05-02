import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { createTaskSchema, updateTaskStatusSchema } from '../schemas';

import { suggestTaskDetails } from '../services/ai';

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createTaskSchema.parse(req.body);

    let finalDueDate = data.dueDate ? new Date(data.dueDate) : null;
    let finalAssigneeId = data.assigneeId;

    // AI Agentic Workflow: If dueDate or assignee is missing, use AI to triage
    if (!finalDueDate || !finalAssigneeId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
        include: { members: { include: { user: { select: { id: true, name: true } } } } }
      });
      
      if (project) {
        const aiSuggestion = await suggestTaskDetails(data.title, data.description, project.members);
        if (aiSuggestion) {
          if (!finalDueDate && aiSuggestion.dueDate) finalDueDate = new Date(aiSuggestion.dueDate);
          if (!finalAssigneeId && aiSuggestion.suggestedAssigneeId && aiSuggestion.suggestedAssigneeId !== 'null') {
             finalAssigneeId = aiSuggestion.suggestedAssigneeId;
          }
        }
      }
    }

    // Let Prisma's foreign key constraints handle missing projectId or assigneeId
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: finalDueDate,
        projectId: data.projectId,
        assigneeId: finalAssigneeId,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    } else {
        next(error);
    }
  }
};

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;
    const whereClause = projectId ? { projectId: String(projectId) } : {};
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' }
      }),
      prisma.task.count({ where: whereClause })
    ]);
    
    res.json({
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateTaskStatusSchema.parse(req.body);
    const taskId = req.params.id;

    const task = await prisma.task.findUnique({ where: { id: taskId as string } });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && task.assigneeId !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden: You can only update your own tasks' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId as string },
      data: { status: data.status },
    });
    
    res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    } else {
        next(error);
    }
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
