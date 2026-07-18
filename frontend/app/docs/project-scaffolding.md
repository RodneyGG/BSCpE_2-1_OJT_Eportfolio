# OJT E-Portfolio: Project Scaffolding & AI Guidelines

This document serves as the master planning and scaffolding guide for the BSCpE 2-1 OJT E-Portfolio project. It is designed to ensure efficient collaboration between developers and AI agents. **All AI agents must read this document to understand the project architecture and workflow before making major changes.**

## 1. Project Architecture

The project is a decoupled Full-Stack application containerized via Docker.

- **Frontend**: Next.js 16 (React 19, TypeScript, Tailwind CSS, Turbopack)
- **Backend**: Laravel (PHP) (Provides RESTful APIs)
- **Database**: MySQL (Primary Data) & Redis (Caching/Sessions)
- **Infrastructure**: Nginx (Reverse Proxy) & Docker Compose

### 1.1 Directory Structure
```text
/
├── frontend/               # Next.js Application
│   ├── app/                # App Router (Pages, Layouts, Context)
│   ├── components/         # Reusable React components
│   ├── public/             # Static assets (images, icons)
│   └── Dockerfile          # Frontend container definition (Uses USER node)
├── backend/                # Laravel Application (API)
├── nginx/                  # Nginx Reverse Proxy configurations
├── .github/workflows/      # CI/CD Pipelines (Deploy to Pages, Lint, Build)
├── .husky/                 # Pre-commit & Pre-push Git Hooks
└── compose.yaml            # Docker orchestration
```

## 2. Standard Operating Procedure (Workflow)

To maintain maximum efficiency and minimize errors, all tasks MUST follow this exact sequence:

1. **Planning (Documentation)**:
   - Understand the user's request fully.
   - Outline the approach, components needed, and API contracts.
   - Update documentation (like this file) if the architecture changes.
2. **Programming (Implementation)**:
   - Execute the planned changes step-by-step.
   - Prioritize targeted edits using file modification tools over full rewrites.
3. **QA (Quality Assurance)**:
   - Run `npm run lint` and `npm run build` locally.
   - Verify mobile responsiveness across standard breakpoints (768px, 640px, 480px).
   - Ensure `husky` pre-push hooks pass smoothly.

## 3. UI/UX & Styling Guidelines

- **Mobile First**: All pages (`app/page.tsx`, `app/profile/page.tsx`, `app/admin/page.tsx`) must be fully responsive. Never hardcode widths that cause horizontal scrolling.
- **Breakpoints**: 
  - Tablet: `max-width: 768px`
  - Mobile Landscape: `max-width: 640px`
  - Mobile Portrait: `max-width: 480px`
- **Aesthetics**: Use premium, modern designs (gradients like `#0f172a` to `#1e3a8a`, subtle shadows, rounded corners, and micro-animations on hover).
- **Icons**: Use inline SVGs for icons to prevent dependency issues, or rely strictly on verified packages.

## 4. State Management & Authentication

- The frontend uses a custom `AuthContext` (in `RoleContext.tsx`) for mock authentication.
- **Roles**: `normal` (Student) and `admin` (Coordinator/Professor).
- UI elements (like the MOA pill, or "Log In" vs User Profile pill) must dynamically react to `isLoggedIn` and `user.role` states.
- *Future Roadmap*: Transition the mock `AuthContext` to fetch JWT tokens from the Laravel backend.

## 5. Guidelines for AI Agents

To ensure you are an efficient collaborator:
- **Do not overwrite entire files unless necessary**: Use targeted replacement tools to inject or modify specific lines of code.
- **Respect Boundaries**: Never run bash commands that alter the host system outside of the project repository.
- **Testing**: Before declaring a task "done", you must ensure no TS errors or ESLint warnings were introduced. Run `npm run lint`.
- **Pre-push Hooks**: The repository uses `husky`. If your code fails linting, the `git push` will be rejected. Always fix errors proactively.
- **Documentation**: Keep this `project-scaffolding.md` updated as new major features (like the Laravel backend integration) come online.

## 6. Current Roadmap

1. **Phase 1: Frontend Overhaul** ✅ (Responsive UI, AuthContext, DTR Layouts)
2. **Phase 2: CI/CD & Project Scaffolding** ✅ (Husky hooks, Actions, Planning docs)
3. **Phase 3: Backend Integration** 🚧 (Connect Laravel API to Next.js Frontend)
4. **Phase 4: File Upload Handling** 🚧 (Process PDF DTR Proofs via backend)
