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

```
BSCpE_2-1_OJT_Eportfolio/
├── frontend/           # Next.js application
│   ├── app/
│   │   ├── components/ # Reusable UI components
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── public/
├── backend/            # Laravel API
├── nginx/              # Nginx reverse proxy config
├── compose.yaml        # Docker Compose
└── docs/               # Project documentation
```

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

| Feature         | Branch                    | Status      |
|-----------------|---------------------------|-------------|
| Landing Page    | feature/landing-page      | In Progress |
