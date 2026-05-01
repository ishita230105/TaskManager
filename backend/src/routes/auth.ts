import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import rateLimit from 'express-rate-limit';

const router = Router();
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { error: 'Too many accounts created from this IP, please try again after 15 minutes' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,15}$/;
const passwordMessage = 'Password must be 8-15 characters and include lowercase, uppercase, number, and special character.';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().toLowerCase(),
  password: z.string().regex(passwordRegex, passwordMessage),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

router.post('/register', registerLimiter, async (req: Request, res: Response) => {
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
      res.status(400).json({ error: error.issues[0].message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string(),
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
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
      res.status(400).json({ error: error.issues[0].message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

const forgotSchema = z.object({
  email: z.string().email().toLowerCase(),
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether user exists or not
      res.json({ message: 'If an account with that email exists, we sent a reset link.' });
      return;
    }

    // Create a reset token that expires in 1 hour
    const secret = JWT_SECRET + user.password; 
    const resetToken = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: '1h' });
    
    const resetLink = `http://localhost:5173/reset-password/${user.id}/${resetToken}`;

    // TODO: Integrate SendGrid for production
    // Replace this mock with actual SendGrid/Resend API call
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Password Reset Request`);
    console.log(`Body: Click here to reset your password: ${resetLink}`);
    console.log('------------------');

    res.json({ message: 'If an account with that email exists, we sent a reset link.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const resetSchema = z.object({
  password: z.string().regex(passwordRegex, passwordMessage),
  token: z.string(),
  userId: z.string()
});

router.post('/reset-password', async (req: Request, res: Response) => {
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
    res.status(400).json({ error: 'Invalid request' });
  }
});

export default router;
