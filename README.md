# Team Task Manager

A full-stack web application designed for teams to create projects, assign tasks, and track progress effectively. Built with modern, responsive, glassmorphic UI elements and a robust backend.

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based login/signup with role-based access control (Admin & Member).
- **Project Management**: Admins can create, delete, and view all projects. Members can view projects.
- **Task Management**: Create, assign, and update statuses of tasks (To Do, In Progress, Done). Admins can manage all tasks; assignees can update their own task status.
- **Dynamic Dashboard**: Real-time overview of projects, tasks, and task statuses.
- **Beautiful UI**: Custom vanilla CSS design system featuring smooth gradients, glassmorphism, and responsive layout.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router DOM, Axios, Lucide React (Icons), Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (or SQLite locally) via Prisma ORM
- **Authentication**: JWT & bcrypt

## 📦 Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AIPROJECTCLG
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Rename .env.example to .env and configure your database URL
   npx prisma generate
   npx prisma db push
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🌐 Deployment to Railway

This repository is configured to be deployed as a single monorepo unit on Railway.

1. Connect your GitHub repository to Railway.
2. Add a **PostgreSQL** plugin in your Railway project.
3. Link the database to your service. Railway will automatically set the `DATABASE_URL`.
4. Add the `JWT_SECRET` and `NODE_ENV=production` environment variables.
5. Railway will use the `nixpacks` builder and the `railway.json` configuration to install dependencies, build both frontend and backend, and start the node server serving both.

## 🎥 Demo Video Guide

*(A 2-5 min walkthrough covering: Architecture, Tech Stack, Live Demo of features, and a brief code walk).*
