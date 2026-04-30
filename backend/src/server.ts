import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import prisma from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Dashboard stats route
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalProjects = await prisma.project.count();
    const totalTasks = await prisma.task.count();
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    });

    const recentActiveTasks = await prisma.task.findMany({
      where: {
        status: { in: ['TODO', 'IN_PROGRESS'] }
      },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    const overdueTasksCount = await prisma.task.count({
      where: {
        dueDate: { lt: new Date() },
        status: { not: 'DONE' }
      }
    });
    
    res.json({
      totalProjects,
      totalTasks,
      tasksByStatus,
      recentActiveTasks,
      overdueTasksCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.get('/health', (req, res) => {
  res.send('API is running...');
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
