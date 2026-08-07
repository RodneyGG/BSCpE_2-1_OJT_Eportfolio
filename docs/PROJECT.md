# BSCpE 2-1 OJT E-Portfolio — Project Documentation

## Overview

A full-stack OJT (On-the-Job Training) E-Portfolio web application for BSCpE 2-1 students.
Built with **Next.js 16 + React 19 + TypeScript** on the frontend and **Laravel** on the backend.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 16, React 19, TypeScript    |
| Styling   | TailwindCSS v4, Vanilla CSS         |
| Fonts     | Geist Sans, Geist Mono (via next/font) |
| Backend   | Laravel (PHP)                       |
| Database  | MySQL (via Docker Compose)          |
| Proxy     | Nginx                               |
| Container | Docker / Docker Compose             |

---

## Project Structure

A basic structure of the workspace is shown below. For a complete directory map, schema outlines, and routing table, please see the detailed [Project Map & System Architecture](file:///home/lloyd/project-bscpe2-1/BSCpE_2-1_OJT_Eportfolio/docs/PROJECT_MAP.md).

```
BSCpE_2-1_OJT_Eportfolio/
├── frontend/           # Next.js application
├── backend/            # Laravel API (PHP FrankenPHP / Octane)
├── nginx/              # Nginx reverse proxy gateway
├── compose.yaml        # Docker Compose orchestration
└── docs/               # Project documentation (including features & mapping)
```

---

## 🗺️ Master Project Map & Architecture

For a comprehensive guide on database schemas, relationship logic, API endpoints mapping, Next.js page routing, UI components, and known architecture limits, please refer to:
👉 **[PROJECT_MAP.md](file:///home/lloyd/project-bscpe2-1/BSCpE_2-1_OJT_Eportfolio/docs/PROJECT_MAP.md)**

---

## Development Workflow

All features follow an **8-phase workflow**:

| Phase | Name             | Description                                      |
|-------|------------------|--------------------------------------------------|
| 0     | Project Planning | Analyze, task breakdown, architecture design     |
| 1     | Documentation    | Specs, UI/UX decisions, API contracts            |
| 2     | Feature Branch   | Dedicated Git branch per feature                 |
| 3     | Programming      | Clean, modular TypeScript implementation         |
| 4     | Manual QA        | Project owner review — pause before commit       |
| 5     | Revisions        | Fix QA issues, update docs                       |
| 6     | Commit           | Conventional Commits after QA approval           |
| 7     | Pull Request     | Push branch, open PR into `main`                 |
| 8     | Merge            | Merge only after all gates pass                  |

---

## Features

See individual feature docs in `docs/features/`.

| Feature                | Branch                        | Status      |
|------------------------|-------------------------------|-------------|
| Landing Page           | feature/portal-redesign       | Completed   |
| GitHub Actions CI      | feature/github-actions-ci     | Completed   |
| Profile + DTR + Upload | feature/dtr-and-uploads       | Completed   |
| Authentication & UI    | feature/auth-and-ui           | Completed   |
| Admin Dashboard        | feature/admin-dashboard       | Completed   |
| Company Auth System    | feature/company-auth-system   | Completed   |

---

## Testing Credentials

Use the following default database-seeded accounts to access the local portal:

**Student Account:**
- **Email**: `student@ojt.dev`
- **Password**: `Student@2026`

**Professor Account:**
- **Email**: `prof@ojt.dev`
- **Password**: `Prof@2026`

**Admin / Coordinator Account:**
- **Email**: `admin@ojt.dev`
- **Password**: `Admin@2026`

