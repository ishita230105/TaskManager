import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth';
import prisma from '../src/prisma';

// Create a small express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock prisma to avoid hitting the actual database
vi.mock('../src/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth API Endpoints', () => {
  it('should return 400 if login credentials are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should return 400 if user tries to register with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weakpassword', // Does not meet regex requirements
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Password must be 8-15 characters');
  });

  it('should return 400 for unknown user login', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'notfound@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email or password');
  });
});
