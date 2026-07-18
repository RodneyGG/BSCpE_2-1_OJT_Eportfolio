# AI Memory Map & Roadmap

This file acts as the AI's "memory map." Before starting a new task, the AI should consult this file to understand the project's current state, what has been accomplished, and what the immediate next steps are.

## 🧠 System Context
- **Project**: BSCpE 2-1 OJT E-Portfolio Tracker
- **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Future Integration**: Laravel API, MySQL, Redis, Docker
- **Workflow**: Planning (Documentation) -> Programming -> QA (Testing/Linting)
- **Constraint**: Must be fully mobile responsive. No horizontal scrolling.

---

## ✅ What Has Been Done (Completed)
- **UI/UX Overhaul**:
  - Restyled landing page, profile page, and admin dashboard with premium gradients (`#0f172a` to `#1e3a8a`).
  - Implemented responsive design (mobile breakpoints) and fixed all UI bleeding/cutoff issues.
  - Added `overflow-x: hidden` to globally prevent horizontal scrolling on mobile.
- **Mock Authentication**:
  - Refactored `RoleContext` into a full `AuthContext` with login/logout states.
  - Implemented role-based routing (`student@university.edu.ph` -> Profile, `admin@university.edu.ph` -> Admin Dashboard).
- **Profile Enhancements**:
  - Added "Guardian Name" and "Guardian Contact" on separate lines for better readability.
  - Added a "DTR Proof" PDF upload placeholder button.
- **DevOps & QA Pipeline**:
  - Configured `husky` to run `npm run lint` and `npm run build` as a `pre-push` hook.
  - Fixed GitHub Pages deployment by adding `actions/configure-pages@v5` to `.github/workflows/deploy-pages.yml`.
- **Documentation**:
  - Created `project-scaffolding.md` for architectural planning.
  - Created `dev-logs.md` to track compilation errors and fixes.

---

## ⏳ In Progress (Current Focus)
- Finalizing the initial frontend "mock" architecture before moving to backend integration.
- Documenting all established workflows and system memory.

---

## 🚀 What To Do Next (Roadmap)

### Phase 3: Backend Preparation
- [ ] **Design API Contracts**: Define the JSON structure for User Auth, DTR Logs, and Company data.
- [ ] **Data Fetching Layer**: Create custom hooks or API utility functions (e.g., `api.ts` or `fetcher.ts`) to replace the hardcoded `COMPANIES` and `logs` arrays.

### Phase 4: Laravel Backend Integration
- [ ] **Authentication Integration**: Replace the mock `AuthContext` with real JWT token-based authentication connected to Laravel.
- [ ] **Database Connection**: Fetch the real list of students and companies from MySQL.
- [ ] **File Uploads**: Implement the backend logic to handle real PDF uploads for the DTR Proofs and store them securely.

### Phase 5: Polish & Deployment
- [ ] **Admin Dashboard Data**: Hook up the admin overview stats to aggregate real backend data.
- [ ] **End-to-End Testing**: Verify the full Docker stack (Next.js + Laravel + Nginx) runs perfectly together.
