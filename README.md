# FocusFlow — Premium MERN Task Tracker

FocusFlow is a modern, responsive, and visually stunning Task Tracker application built with the **MERN Stack** (MongoDB, Express, React with TypeScript, and Node.js). 

It features real-time task management (CRUD), inline form validations, task completion statistics, priority ratings, due date indicators, dynamic frontend-side search/filter/sort options, and an adaptive dark/light mode.

---

## Repository Structure

```
Assingment_CollegeEdge/
├── backend/
│   ├── config/db.js          # MongoDB database connection helper
│   ├── controllers/          # Request handler controllers
│   ├── models/Task.js        # Mongoose database model (Schema & Validation)
│   ├── routes/taskRoutes.js  # REST API routing
│   ├── server.js             # Main server entry point
│   ├── test-api.js           # Programmatic backend validation suite
│   ├── .env                  # Environment configuration file
│   └── package.json          # Node dependencies & run scripts
└── frontend/
    ├── src/
    │   ├── components/       # Reusable components (Form, List, Item, Stats, Notification)
    │   ├── App.tsx           # Global state control & API connector
    │   ├── index.css         # CSS variables design system, glassmorphism & micro-animations
    │   ├── types.ts          # TypeScript type definitions
    │   └── main.tsx          # Client entry mounting
    ├── index.html            # App shell with SEO optimization tags
    ├── package.json          # Vite frontend configurations
    └── tsconfig.json         # TypeScript compiler configurations
```

---

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (either running locally on port `27017` or a MongoDB Atlas URI)

### 1. Setup Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example (or edit the existing `.env`):
   ```bash
   cp .env.example .env
   ```
4. Verify/configure `PORT=5005` and your `MONGODB_URI` (default is `mongodb://localhost:27017/tasktracker`).
5. Launch the backend server:
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173/`.

---

## REST API Reference

The backend exposes a REST API at `http://localhost:5005/api/tasks`:

- **Get Tasks**: `GET /api/tasks`
  - Supports query filters: `?status=completed&priority=high&search=rest&sortBy=dueDate&order=asc`
- **Create Task**: `POST /api/tasks`
  - Body: `{ title: string, description?: string, status?: string, priority?: string, dueDate?: string }`
- **Get Task details**: `GET /api/tasks/:id`
- **Update Task details/status**: `PUT /api/tasks/:id`
  - Body: `{ title?: string, description?: string, status?: string, priority?: string, dueDate?: string }`
- **Delete Task**: `DELETE /api/tasks/:id`

---

## Automated Backend Testing

An integration test suite is included in the backend directory. To run it, make sure the backend server is running, and then execute:

```bash
cd backend
node test-api.js
```

---

## Production Deployment Guide

To deploy this full-stack application on public URLs, you can follow these guides:

### Backend Deployment (e.g., Render)
1. Push your code repository to GitHub.
2. Sign in to [Render](https://render.com/) and create a new **Web Service**.
3. Link your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. In the **Environment** settings, define the following variables:
   - `PORT`: `10000` (or leave default, Render sets this automatically)
   - `MONGODB_URI`: Provide your MongoDB Atlas Connection String.
   - `NODE_ENV`: `production`
6. Click deploy. Render will give you a public URL (e.g., `https://my-backend.onrender.com`).

### Frontend Deployment (e.g., Vercel)
1. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Link your GitHub repository.
3. Set the following settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add an **Environment Variable** in the Vercel dashboard:
   - `VITE_API_URL`: Set this to your deployed backend URL + `/api/tasks` (e.g., `https://my-backend.onrender.com/api/tasks`).
5. Click deploy. Vercel will build the frontend assets and provide you with a public URL (e.g., `https://my-frontend.vercel.app`).
