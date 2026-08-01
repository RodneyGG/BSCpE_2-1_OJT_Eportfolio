# AI_CONTEXT.md — Newly Added Features (BSCpE 2-1 OJT E-Portfolio)

Purpose: this file summarizes work added on top of the original fork
(`RodneyGG/BSCpE_2-1_OJT_Eportfolio`) across `feature/document-review-workflow`,
`feature/admin-user-management`, and `feature/dashboard-redesign`. Read this
before scanning the repo — it tells you what exists, where it lives, and what
NOT to redo.

## Stack / Architecture (unchanged from upstream, restated for grounding)

- Next.js 16 / React 19 / TypeScript / TailwindCSS v4 (frontend)
- Laravel PHP 8.4 on Octane + FrankenPHP (backend) — after ANY backend file
  edit, run `docker compose exec backend php artisan octane:reload` before
  testing; Octane caches the app in memory and will NOT pick up edits otherwise.
- MySQL 8.0, Redis 7, Nginx reverse proxy, Docker Compose
- Auth: Laravel Sanctum, Bearer-token (NOT cookie-based)
- File storage: Google Drive API (service account) + Google OAuth (admin-only)
- Nginx routes `/api/*` and `/sanctum/*` to Laravel (`:8000`); everything else
  to Next.js (`:3000`).
- `composer` is NOT installed in the backend container, only `php`. Migrations
  needing extra packages must use raw `DB::statement()`.

## Feature: Document Review Workflow

**Backend:**
- `backend/app/Http/Controllers/Api/DocumentController.php` — approve/reject
  endpoint, `PATCH /documents/{id}/review` with body `{ status: "approved" |
  "rejected", reason?: string }` (reason required server-side when rejecting)
- `backend/app/Services/DocumentService.php` — DTR supersede-on-upload logic
  (re-uploading a DTR replaces the prior pending one instead of stacking)
- `backend/app/Models/Document.php` — `claimed_hours` field added
- `backend/app/Http/Requests/UploadDocumentRequest.php` — upload validation
- New endpoint: `GET /api/documents/mine` — student's own upload history
- 15 `document_type` slugs are locked in (used by frontend for DTR-specific
  logic — see below); not all upload/seed code uses them yet.

**Frontend:**
- `frontend/app/components/DocumentReviewList.tsx` — the shared, reusable
  approve/reject list component. Exports `ReviewableDocument` interface.
  Props: `documents`, `onDocumentsChange(updater)`, `fallbackUser?`,
  `emptyMessage?`, `showUserName?`. Calls `PATCH /documents/{id}/review`
  directly. Special-cases `document_type === "dtr"`: approving one opens a
  confirm dialog showing current hours → `claimed_hours` (claimed_hours is
  treated as the NEW ABSOLUTE TOTAL, not an increment). Depends on
  `frontend/app/components/DocumentViewerModal.tsx` for the "View document"
  preview.
- **KNOWN LIMITATION:** `onDocumentsChange`'s signature only tells the caller
  "this id left the list" — it cannot distinguish an approve from a reject.
  Callers needing that distinction (see AdminStudentPanel below) must infer
  it themselves, which is fragile. If extending this component, consider
  adding an explicit `onAfterAction?: (doc, action: "approved" | "rejected")
  => void` instead of reverse-engineering intent from removal events.
- `frontend/app/components/PendingApprovalSection.tsx` — the original global
  pending-approval queue (predates `DocumentReviewList`; NOT yet refactored
  to use it, though that's a safe optional cleanup, not required).

## Feature: Admin User Management

**Backend:**
- User CRUD/admin actions: create, reset password, toggle review access,
  deactivate/reactivate — see `backend/app/Http/Controllers/Api/UserController.php`
- `backend/app/Http/Controllers/Api/AuthController.php` — auth changes
  supporting the above

**Frontend:**
- `frontend/app/admin/page.tsx` — Manage Users UI; client-side role guard
  added here (closed a prior access hole where non-admins could reach this
  route)

## Feature: Students Roster (`/students`)

**Backend:**
- `GET /students?role=normal` — role-aware. Staff (admin/professor) get full
  data + per-student document counts; students get a stripped-down view of
  themselves only. Implemented in `UserController@index`.
- `GET /admin/users/{id}` — full per-student detail for staff: `phone`,
  `program`, `ojt_role`, `ojt_supervisor`, `documents[]`. Bare object
  response, no wrapper. Implemented in `UserController@show`.
- New fields on `users` table: `required_hours` (migration
  `2026_07_31_220930_add_required_hours_to_users_table.php`), plus
  pre-existing `phone`/`program` (do NOT re-add these, they already existed
  before this work — see `2026_07_31_120000_add_phone_and_program_to_users_table.php`
  for the deployment-detail fields actually added this round).

**Frontend:**
- `frontend/app/students/page.tsx` — avatar grid, status-badge dot per
  student (red = pending, amber = needs resubmission, green = clear),
  role-conditional click target.
- `frontend/app/components/StudentPreviewModal.tsx` — student-facing modal:
  name, company, hours/required hours, status pill, shared block/adviser
  info via `GET /block`.
- `frontend/app/components/AdminStudentPanel.tsx` — staff-facing slide-in
  side panel. Fetches `GET /admin/users/{id}` on mount. Renders General
  Info, Deployment Details, Hours Rendered, and embeds `DocumentReviewList`
  scoped to that student's pending documents (`showUserName={false}` since
  already scoped to one student).
  - **KNOWN LIMITATION:** the panel's "Hours Rendered" summary uses local
    React state (`renderedHoursOverride`) updated optimistically when a DTR
    is approved. This state is lost on unmount — closing and reopening the
    panel, or navigating away, shows the STALE pre-approval value from the
    parent roster list's `student.hours_rendered` prop until that list
    itself refetches. The parent `/students` page does not currently have
    a callback (e.g. `onHoursUpdated`) to patch its own array when a child
    panel changes something. This is the single most important thing to fix
    before this feature is considered fully done — the backend value IS
    correct, only the UI is stale.
  - Also inherits the approve-vs-reject ambiguity noted under
    `DocumentReviewList` above: it diffs before/after document lists itself
    to guess whether a DTR was approved, and currently has NO reliable way
    to avoid a false-positive hours bump if a DTR is rejected while pending.
- `frontend/app/students/[id]/page.tsx` — **DELETED**. Superseded by the
  `AdminStudentPanel` slide-in panel; do not recreate this route.

## Feature: Blocks

- `backend/app/Models/Block.php`, `backend/app/Http/Controllers/Api/BlockController.php`
- Migration: `2026_07_31_044655_create_blocks_table.php`
- Groups students under a block/adviser; consumed by `StudentPreviewModal`
  via `GET /block`.

## Feature: Dashboard / Landing Page (`/`)

- `frontend/app/page.tsx` — company accordion (live from `GET /companies`),
  hero stat tiles (Companies / Students / OJT Hrs).
- The "Students" stat tile is clickable for ALL roles → routes to
  `/students` via `useRouter().push("/students")`. No role gating on this
  tile intentionally. Companies and OJT Hrs tiles remain inert (`href: null`
  in the tile config array) — do not accidentally make them clickable when
  editing this array.

## Feature: Navigation

- `frontend/app/components/AppNavbar.tsx` — shared, role-aware navbar
  replacing old per-page hardcoded nav blocks. Role-conditional links,
  profile dropdown, Help/Docs/User Manual/Bug Report/GitHub links,
  notification badge. Config lives in `frontend/app/lib/config.ts` (if
  editing nav links, edit there, not inline in the component).

## Feature: Profile Page

- `frontend/app/profile/page.tsx` — large overhaul (~1000 line diff), wired
  to real document/upload data.
- `frontend/app/components/JournalSection.tsx` — **DELETED**, superseded by
  the above. Do not recreate.
- **NOT YET BUILT:** accordion UI for Before/During/After OJT phases — this
  was scoped in an earlier session but deferred, still outstanding.

## Cross-cutting gotchas for any agent working on this repo

1. Frontend hot-reload can serve stale code after `docker compose restart`
   or `stop`+`start` due to an anonymous `.next` volume persisting. If an
   edit "isn't taking effect," don't assume the edit is wrong — first run:
   ```
   docker compose stop frontend
   docker compose rm -f -v frontend
   docker compose up -d frontend
   ```
2. Backend edits require `docker compose exec backend php artisan octane:reload`
   before they're live — Octane, not the standard PHP dev server.
3. Sanctum tokens expire between sessions/containers restarts — re-login
   before testing anything auth-gated.
4. Pre-existing, intentionally out of scope right now: no SMTP/email infra;
   `nginx_proxy` shows `(unhealthy)` in `docker compose ps` despite working
   correctly — known false-positive healthcheck, not a real issue.
5. Branch stacking: `feature/dashboard-redesign` is built on top of
   `feature/admin-user-management`, which is built on top of
   `feature/document-review-workflow`. None of these had merged to `main`
   as of this document's writing. If you're an agent opening or reviewing a
   PR, check current merge status before assuming a diff represents only
   "new" work — it may include all three branches' combined history.