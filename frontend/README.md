# BSCpE 2-1 OJT E-Portfolio - Frontend

This is the frontend component of the BSCpE 2-1 OJT E-Portfolio system. It provides an intuitive, responsive, and visually appealing web interface for students to track their on-the-job training progress and for administrators to manage placements.

## Architecture & Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS-in-JS via inline styles & global CSS)
- **State Management**: React Context (`RoleContext.tsx`)
- **Deployment**: Configured for static export (can be deployed on Vercel, GitHub Pages, or any static host)
- **Icons**: Inline SVG Icons (Lucide/Feather inspired)
- **Avatars**: ui-avatars.com (Dynamic Initials)

## Project Structure

```
frontend/
├── app/                  # Next.js App Router root
│   ├── admin/            # Admin/Professor Dashboard page
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers (RoleContext for Auth)
│   ├── data/             # Mock data and static definitions
│   ├── docs/             # Frontend-specific documentation
│   ├── login/            # Authentication page
│   ├── profile/          # Student Profile and DTR tracking page
│   ├── students/         # Student directory/views
│   ├── globals.css       # Global styles and resets
│   ├── layout.tsx        # Root layout wrapper
│   └── page.tsx          # Landing/Home page
├── public/               # Static assets (images, icons)
├── package.json          # Project dependencies and scripts
└── next.config.ts        # Next.js configuration (configured for static export)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

1. **Role-Based Access Control**:
   - The app uses a simulated authentication system (`RoleContext.tsx`).
   - Supports three roles: `normal` (Student), `admin` (Administrator), and `prof` (Professor).
   - Auth state is persisted across reloads using `localStorage`.

2. **Student Dashboard (`/profile`)**:
   - DTR (Daily Time Record) tracking with hour calculation and progress visualization.
   - Weekly journal entries.
   - Document upload simulation (drag and drop or click to upload).
   - Profile picture management with memory-leak prevention.

3. **Admin Dashboard (`/admin`)**:
   - Directory of partner companies and assigned students.
   - Real-time search and filtering.
   - Document approval workflow interface.
   - Modal views for detailed student metrics.

4. **Public Landing Page (`/`)**:
   - Overview of the OJT program.
   - Interactive accordion list of partner companies.
   - Animated UI components.

## Building for Production

This project is configured to build as a static site.

```bash
npm run build
```

The output will be generated in the `out/` directory, which can be deployed to any static web hosting service (e.g., GitHub Pages, AWS S3, Nginx).

## QA & Development Notes

- **Mock Data**: Currently, the application relies on hardcoded data for demonstration purposes. In a production environment, this should be replaced with API calls (e.g., using `fetch` or a library like `SWR`/`React Query`) connecting to the backend.
- **Image Optimization**: The project uses standard `<img>` tags for external avatars (`ui-avatars.com`) with ESLint rules disabled for these specific instances due to the static export constraint (`unoptimized: true` in `next.config.ts`).
- **State Persistence**: The `RoleContext` utilizes `localStorage` to ensure users remain logged in when refreshing the page.

## License

This project is part of the BSCpE 2-1 OJT E-Portfolio system.
