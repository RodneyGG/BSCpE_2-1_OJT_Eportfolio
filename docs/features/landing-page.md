# Feature: Landing Page

## Branch
`feature/landing-page`

## Status
`In Progress`

---

## Overview

A single-page scrolling OJT E-Portfolio landing page for **BSCpE 2-1**.

**Color Theme:** Light mode — clean white with blue/teal professional feel  
**Typography:** Geist Sans (primary), Geist Mono (code/accents)  
**Layout:** Single-page with smooth scroll navigation

---

## Sections

| # | Section              | Component             | Description                                      |
|---|----------------------|-----------------------|--------------------------------------------------|
| 1 | Navbar               | `Navbar.tsx`          | Sticky top nav, smooth scroll links, logo        |
| 2 | Hero                 | `HeroSection.tsx`     | Name, course, OJT tagline, CTA button            |
| 3 | About Me             | `AboutSection.tsx`    | Photo, bio, personal info cards                  |
| 4 | Skills               | `SkillsSection.tsx`   | Technical & soft skills with visual indicators   |
| 5 | OJT Company          | `CompanySection.tsx`  | Company profile, role, location, duration        |
| 6 | Weekly Journal/Logs  | `JournalSection.tsx`  | Weekly log cards with expandable entries         |
| 7 | Documents            | `DocumentsSection.tsx`| Certificates, clearances, documents gallery      |
| 8 | Contact              | `ContactSection.tsx`  | Contact info links and social links              |

---

## UI/UX Decisions

- **Navbar:** Fixed/sticky at top, background blur on scroll, smooth anchor scroll behavior
- **Hero:** Full viewport height, centered text, animated entrance (fade-in + slide-up), gradient text for name
- **About Me:** Two-column layout (photo | bio), info chips (course, year, school)
- **Skills:** Pill/badge grid for technical skills; star or bar for proficiency
- **Company:** Card layout with company logo placeholder, role badge, dates
- **Journal:** Accordion-style weekly logs, chronological order, date badge per card
- **Documents:** Responsive grid of document cards with type icon, download/view link
- **Contact:** Clean links (email, LinkedIn, GitHub, Facebook) with icon buttons
- **Footer:** Minimal — name, year, course

---

## Component Hierarchy

```
page.tsx
├── Navbar
├── HeroSection
├── AboutSection
├── SkillsSection
├── CompanySection
├── JournalSection
├── DocumentsSection
├── ContactSection
└── Footer (inline or component)
```

---

## API Endpoints

Not applicable for Phase 1 — all data is static/hardcoded.
Backend integration will be added in future phases.

---

## Environment Variables

No new environment variables required for this feature.

---

## Architectural Decisions

- Components live in `app/components/` (not `components/` root) to keep them co-located with the App Router.
- Static data (journal logs, skills, company info) will be typed TypeScript objects defined inline per component for Phase 1.
- All section IDs match the Navbar anchor links (e.g., `id="about"`, `id="skills"`, etc.).
- TailwindCSS v4 utility classes used for styling.
- Smooth scroll behavior enabled globally via CSS `scroll-behavior: smooth`.
- `next/image` used for all images (optimized).

---

## Acceptance Criteria

- [ ] Navbar is sticky and highlights active section
- [ ] Hero section is visually striking with animation
- [ ] All 8 sections are present and scroll correctly from navbar links
- [ ] Page is fully responsive (mobile, tablet, desktop)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Design is clean, professional, and "wow" factor on first load
