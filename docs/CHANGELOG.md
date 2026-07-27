# Changelog

## [Unreleased]
### Added
- Feature branch: `feature/company-auth-system`
- Company Assignment system allowing students to select their affiliated companies.
- Role-based access control and first-time login password change enforcement.
- Integrated Google Drive API (`GoogleDriveService`) for secure backend document storage.
- Admin capabilities to view student company assignments and overview.
- Feature branch: `feature/backend-octane-frankenphp`
- Integrated Laravel Octane for high-performance HTTP request handling.
- Configured FrankenPHP as the application server for Laravel Octane.
- Created `UserSeeder` to generate default administrator and test users.

### Changed
- Replaced the single-threaded `php artisan serve` in the backend `Dockerfile` with a production-ready FrankenPHP base image (`dunglas/frankenphp:1.4-php8.4-alpine`).
- Updated the backend `Dockerfile` to expose port 8000 and run the `php artisan octane:start` command by default.
- Modified `compose.yaml` to include the `OCTANE_SERVER=frankenphp` environment variable for the backend service.

### Fixed
- Addressed arbitrary file read and info disclosure vulnerabilities in Next.js dependencies (`postcss`, `sharp`) via npm overrides in frontend.
