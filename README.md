# Akademia — Student Management System

A full-stack Student Management System with an admin dashboard, student/department/course CRUD, search & filtering, pagination, and analytics charts.

> **Stack note:** This project was originally scoped as Java Spring Boot + MySQL. It has been built instead on a modern JavaScript/TypeScript stack (React, Express, PostgreSQL) for a faster, type-safe, end-to-end developer experience. There is no Maven/`pom.xml` or MySQL script in this repo — see the [Database Setup](#database-setup) section below for the PostgreSQL equivalent.

## Features

- **Admin Login** — simple username/password gate protecting the dashboard
- **Dashboard** — total students/departments/courses, average CGPA & attendance, department/year distribution charts, recent students
- **Students** — search by name/email/code, filter by department, paginated list, create/view/edit/delete
- **Departments** — full CRUD with live student & course counts
- **Courses** — full CRUD with department filter and enrollment counts
- **Attendance & CGPA** — tracked per-student and surfaced on the dashboard and student profile

## Technologies Used

| Layer          | Technology                                              |
|----------------|----------------------------------------------------------|
| Frontend       | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query, wouter (routing) |
| Backend        | Node.js, Express 5, TypeScript                          |
| Database       | PostgreSQL, Drizzle ORM                                  |
| Validation     | Zod                                                       |
| API contract   | OpenAPI spec + Orval codegen (typed React Query hooks)   |
| Build tooling  | pnpm workspaces, esbuild, tsc                             |

## Folder Structure

```
.
├── artifacts/
│   ├── api-server/              # Express backend
│   │   └── src/
│   │       ├── routes/          # students, departments, courses, dashboard routes
│   │       ├── middlewares/
│   │       └── index.ts         # server entrypoint
│   └── student-management/      # React frontend
│       └── src/
│           ├── pages/           # login, dashboard, students, departments, courses, profile
│           ├── components/      # UI components + layout
│           ├── hooks/           # use-auth, etc.
│           └── App.tsx          # routing
├── lib/
│   ├── db/                      # Drizzle schema + DB client
│   │   └── src/schema/          # departments.ts, courses.ts, students.ts
│   ├── api-spec/                # OpenAPI specification (source of truth for the API contract)
│   ├── api-zod/                 # generated Zod schemas
│   └── api-client-react/        # generated typed React Query hooks
├── scripts/
│   └── src/seed.ts              # seeds sample departments/courses/students
├── package.json                 # root workspace scripts
├── pnpm-workspace.yaml
├── LICENSE
└── README.md
```

## Default Login

The admin login is a lightweight client-side gate (no user table/auth server) intended for demoing the dashboard:

```
Username: admin
Password: admin123
```

## Database Setup

This project uses **PostgreSQL** with **Drizzle ORM** (no manual `.sql` script required — the schema is defined in code and pushed directly).

1. Provision a PostgreSQL database and set the `DATABASE_URL` environment variable, e.g.:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/student_management
   ```
2. Push the schema (creates `departments`, `courses`, `students` tables):
   ```bash
   pnpm --filter @workspace/db run push
   ```
3. Seed sample data (3 departments, 7 courses, 8 students — safe to re-run, it skips if data already exists):
   ```bash
   pnpm --filter @workspace/scripts run seed
   ```

### Sample seeded data

- **Departments:** Computer Science, Electrical Engineering, Business Administration
- **Courses:** 7 courses spread across the departments (e.g. Data Structures & Algorithms, Database Systems, Circuit Theory, Financial Accounting)
- **Students:** 8 students with realistic names, contact info, CGPA, and attendance percentages

## How to Run Locally

### Prerequisites

- Node.js 24+
- pnpm (`corepack enable` will provide it, or `npm i -g pnpm`)
- A PostgreSQL database

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Create a `.env` (or export directly) with:

```
DATABASE_URL=postgresql://user:password@localhost:5432/student_management
```

### 3. Set up the database

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/scripts run seed
```

### 4. Run the backend (API server)

```bash
pnpm --filter @workspace/api-server run dev
```

The API listens on the port provided via the `PORT` env var (defaults per environment) and exposes all routes under `/api`.

### 5. Run the frontend

```bash
pnpm --filter @workspace/student-management run dev
```

This starts the Vite dev server. The frontend calls the API via relative `/api/...` paths, so both services should be reachable through the same host/proxy in production, or configured with a dev proxy locally.

### 6. Type-check everything

```bash
pnpm run typecheck
```

### 7. Build for production

```bash
pnpm run build
```

## API Endpoints

All endpoints are served under `/api`:

| Method | Endpoint                 | Description                          |
|--------|---------------------------|---------------------------------------|
| GET    | `/api/dashboard/summary`  | Aggregate stats for the dashboard    |
| GET    | `/api/departments`        | List departments (with counts)       |
| POST   | `/api/departments`        | Create a department                  |
| GET    | `/api/departments/:id`    | Get a department                     |
| PATCH  | `/api/departments/:id`    | Update a department                  |
| DELETE | `/api/departments/:id`    | Delete a department                  |
| GET    | `/api/courses`            | List courses (optional `departmentId` filter) |
| POST   | `/api/courses`            | Create a course                      |
| GET    | `/api/courses/:id`        | Get a course                         |
| PATCH  | `/api/courses/:id`        | Update a course                      |
| DELETE | `/api/courses/:id`        | Delete a course                      |
| GET    | `/api/students`           | List students (search, department filter, pagination) |
| POST   | `/api/students`           | Create a student                     |
| GET    | `/api/students/:id`       | Get a student                        |
| PATCH  | `/api/students/:id`       | Update a student                     |
| DELETE | `/api/students/:id`       | Delete a student                     |

## Screenshots

_Add screenshots of the Login, Dashboard, Students, Departments, and Courses pages here after cloning and running the app locally._

```
docs/screenshots/login.png
docs/screenshots/dashboard.png
docs/screenshots/students.png
docs/screenshots/departments.png
docs/screenshots/courses.png
```

## Uploading to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Student Management System"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Anyone cloning the repo can then follow [How to Run Locally](#how-to-run-locally) to get the app running.

## License

This project is licensed under the [MIT License](./LICENSE).
