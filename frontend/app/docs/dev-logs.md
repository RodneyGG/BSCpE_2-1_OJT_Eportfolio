# Development Logs (Error & Compilation Tracker)

This file serves as a ledger for tracking errors encountered during development, the steps taken to compile fixes, and reference material for future development. 

## Log Format
When recording a new issue, please use the following format:
- **Date**: [YYYY-MM-DD]
- **Issue/Error**: [Brief description or exact error message]
- **Root Cause**: [What caused the issue]
- **Solution/Compilation Fix**: [How it was fixed and any commands run]

---

## Log Entries

### Date: 2026-07-18
- **Issue/Error**: Next.js GitHub Pages deployment failing during GitHub Actions.
- **Root Cause**: Next.js export requires a specific GitHub Pages setup step in the CI pipeline to configure `basePath` correctly before the static export.
- **Solution/Compilation Fix**: Added `actions/configure-pages@v5` to `.github/workflows/deploy-pages.yml` right after the code checkout step. 

### Date: 2026-07-18
- **Issue/Error**: UI elements (like the Admin search bar) getting cut off or bleeding over the edges on mobile devices. Horizontal scrolling at the bottom of the page.
- **Root Cause**: Hardcoded widths (e.g. `width: 300px`) and missing horizontal overflow protections in CSS.
- **Solution/Compilation Fix**: 
  - Added `overflow-x: hidden` to `html, body` in `globals.css`.
  - Replaced fixed widths with `width: 100%; max-width: 300px;`.
  - Tuned mobile paddings for the `<main>` container across pages.

### Date: 2026-07-18
- **Issue/Error**: Husky `pre-push` not aborting on lint/build errors locally.
- **Root Cause**: Husky hooks were unconfigured in the root directory. 
- **Solution/Compilation Fix**: 
  - Initialized Husky in the root via `npm install husky --save-dev` in frontend.
  - Added `.husky/pre-push` script to execute `npm run lint` and `npm run build` from the `frontend` dir.
  - Added `"prepare": "cd .. && husky .husky"` in `frontend/package.json` for future clones.

### Date: 2026-07-18
- **Issue/Error**: GitHub Actions throwing deprecation warnings: `Node 20 is being deprecated. This workflow is running with Node 24 by default.`
- **Root Cause**: The `actions/setup-node@v4` step in workflows was hardcoded to use Node `20`.
- **Solution/Compilation Fix**: Upgraded `node-version` from `20` to `24` in both `.github/workflows/deploy-pages.yml` and `.github/workflows/ci.yml`.
