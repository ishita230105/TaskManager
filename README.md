# Team Task Manager

A production-ready full-stack task management system featuring role-based access control, scalable API architecture, and real-time dashboard analytics.

**[🚀 View Live Deployment Here]** *(taskmanagerpro.up.railway.app)*
<!-- **[🎥 View Demo Walkthrough Here]** *(Replace with your video link!)* -->

---

## 🏗️ Technical Highlights & Engineering Trade-offs

Instead of just building a generic CRUD app, I focused on building a resilient, senior-level MVP that can handle production constraints:

*   **API Scalability (Pagination):** Implemented cursor/offset pagination (`skip` & `take`) on the `GET /tasks` and `GET /projects` endpoints. Fetching 10,000 tasks at once would cripple the frontend; this ensures O(1) query scaling and fast UI renders.
*   **Enterprise-Grade Security:** 
    *   Integrated `express-rate-limit` on authentication routes to prevent brute-force credential stuffing.
    *   Strict environmental variable validation: The server throws a fatal crash on startup if `JWT_SECRET` is missing, preventing insecure fallbacks in production.
*   **High-Concurrency Optimization:** Designed the dashboard route to execute multiple database queries concurrently using `Promise.all()`, mitigating event-loop blocking and preventing waterfall query performance bottlenecks.
*   **Database Integrity & Error Handling:** Rely on strict Prisma-level schema relations (`onDelete: Cascade`) for data consistency, coupled with a centralized Express error-handling middleware for structured observability.
*   **Testing Infrastructure:** Configured `vitest` and `supertest` for integration testing on the authentication flow, ensuring core business logic is bulletproof before deployments.
*   **Frontend Stability:** Implemented a global React `<ErrorBoundary>` component to gracefully catch and handle any unexpected React lifecycle crashes, ensuring users never see a white screen of death.
*   **CSS Architecture:** Chose a custom Vanilla CSS utility-class system over Tailwind. This avoids dependency bloat, demonstrates a deep understanding of the CSS cascade, and allowed me to build a highly performant glassmorphic design system from scratch.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router DOM, Axios, Lucide React (Icons), Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL via Prisma ORM
- **Testing**: Vitest, Supertest
- **Deployment**: Railway (Nixpacks Monorepo setup)

## 📦 Local Setup & Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd TaskManager
   ```

2. **Setup Environment Variables**
   ```bash
   cd backend
   # Rename .env.example to .env and configure the following variables:
   # DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   # JWT_SECRET="your_super_secret_key"
   npx prisma generate
   npx prisma db push
   cd ..
   ```

3. **Install Dependencies & Start (One Command)**
   ```bash
   # From the root directory, install all dependencies and start both servers concurrently
   npm run install-all
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.*

## 🌐 Deployment Architecture

This project is deployed as a single monorepo unit on **Railway**.
The `railway.json` and root `package.json` configurations utilize Railway's `nixpacks` builder to inject Node.js 20, install `devDependencies`, build both the Vite frontend and TypeScript backend concurrently, and start an Express static file server for the production UI.
