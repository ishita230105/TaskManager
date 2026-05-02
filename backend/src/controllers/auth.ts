import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { registerSchema, loginSchema, forgotSchema, resetSchema } from '../schemas';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'MEMBER',
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    } else {
      next(error);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    } else {
      next(error);
    }
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ message: 'If an account with that email exists, we sent a reset link.' });
      return;
    }

    const secret = JWT_SECRET + user.password; 
    const resetToken = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: '1h' });
    
    const resetLink = `http://localhost:5173/reset-password/${user.id}/${resetToken}`;

    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Password Reset Request`);
    console.log(`Body: Click here to reset your password: ${resetLink}`);
    console.log('------------------');

    res.json({ message: 'If an account with that email exists, we sent a reset link.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, token, userId } = resetSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(400).json({ error: 'Invalid link or expired' });
      return;
    }

    const secret = JWT_SECRET + user.password;
    try {
      jwt.verify(token, secret);
    } catch (e) {
      res.status(400).json({ error: 'Invalid link or expired' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    } else {
        next(error);
    }
  }
};
