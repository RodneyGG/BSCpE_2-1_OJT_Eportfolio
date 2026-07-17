# Feature: Companies OJT Tracker

## Branch
`feature/companies-page`

## Status
`In Progress`

---

## Overview

A dedicated `/companies` page for tracking all OJT companies and the students assigned to them.
This is a **tracker** — not a personal portfolio — accessible by students, professors, and admins
with different levels of visibility per role.

---

## Roles & Access Control

| Role      | What they can see                                                     |
|-----------|-----------------------------------------------------------------------|
| `normal`  | Company info, student names/photos (read-only, no clickable actions)  |
| `prof`    | All of the above + can click student to view their documents          |
| `admin`   | All of the above + can click student to view their documents          |

> Auth is **mocked** in Phase 1 via a `RoleContext` and a UI toggle.
> Real authentication (Laravel Sanctum / session) will replace this in a future phase.

---

## Page: `/companies`

### Company Card
| Field          | Description                                         |
|----------------|-----------------------------------------------------|
| Company Name   | Display name of the OJT company                     |
| Address        | Full address of the company                         |
| Student Count  | Number of students currently doing OJT there        |
| MOA Button     | Disabled placeholder — links to MOA file (Phase N)  |
| Student List   | Collapsible dropdown listing students in the company|

### Student Row (inside dropdown)
| Field   | Normal User          | Prof / Admin                               |
|---------|----------------------|--------------------------------------------|
| Photo   | Visible, not clickable | Clickable → navigates to student detail  |
| Name    | Visible, not clickable | Clickable → navigates to student detail  |
| Course  | Visible              | Visible                                    |

---

## Page: `/students/[id]` (Stub)

Accessible only to `prof` and `admin` roles.
Normal users navigating directly are shown an "Access Denied" message.

In Phase 1: shows a placeholder "Documents coming soon" page.
In a future phase: shows the student's uploaded OJT documents.

---

## Component Hierarchy

```
/companies/page.tsx
├── RoleToggle (mock — top right corner)
└── CompanyCard (per company)
    └── StudentRow (per student, role-aware)

/students/[id]/page.tsx
└── StudentDetailStub (role-gated)
```

---

## Data Shape (Static Mock — Phase 1)

```typescript
interface Student {
  id: string;
  name: string;
  photo: string;   // path to public asset or placeholder
  course: string;
}

interface Company {
  id: string;
  name: string;
  address: string;
  sector: string;
  students: Student[];
  hasMOA: boolean;  // controls MOA button state
}
```

---

## API Endpoints (Future Phase)

| Method | Endpoint                   | Description                         |
|--------|----------------------------|-------------------------------------|
| GET    | `/api/companies`           | List all companies with student count|
| GET    | `/api/companies/:id`       | Company detail + student list       |
| GET    | `/api/students/:id`        | Student detail + documents          |
| GET    | `/api/companies/:id/moa`   | Serve/download MOA file             |

---

## Architectural Decisions

- `/companies` is a **Next.js App Router** page (new route, not a section of the landing page)
- The Navbar will have a "Companies" link that routes to `/companies` (not a scroll anchor)
- `RoleContext` is a React context providing `role` and `setRole` globally
- `RoleToggle` is a development/demo UI element — to be removed or replaced by real auth
- `StudentRow` reads from `RoleContext` to decide if clicks are enabled
- MOA button is `disabled` with a tooltip "Available in a future update"

---

## Acceptance Criteria

- [ ] `/companies` page loads with a list of companies
- [ ] Each company card shows: name, address, student count, MOA button (disabled)
- [ ] Clicking a company expands a dropdown of students (name + photo)
- [ ] Normal users: student rows are non-interactive
- [ ] Prof/Admin users: student rows are clickable → navigates to `/students/[id]`
- [ ] `/students/[id]` shows a role-gated stub page
- [ ] Role toggle (mock) visibly switches between normal / prof / admin
- [ ] Page is fully responsive
- [ ] No TypeScript errors
