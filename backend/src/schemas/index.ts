import { z } from 'zod';

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,15}$/;
export const passwordMessage = 'Password must be 8-15 characters and include lowercase, uppercase, number, and special character.';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().toLowerCase(),
  password: z.string().regex(passwordRegex, passwordMessage),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string(),
});

export const forgotSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetSchema = z.object({
  password: z.string().regex(passwordRegex, passwordMessage),
  token: z.string(),
  userId: z.string()
});

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string(),
  assigneeId: z.string().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});
