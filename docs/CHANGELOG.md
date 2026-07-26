# Changelog

## [Unreleased]
### Added
- Feature branch: `feature/backend-octane-frankenphp`
- Integrated Laravel Octane for high-performance HTTP request handling.
- Configured FrankenPHP as the application server for Laravel Octane.
- Created `UserSeeder` to generate default administrator and test users.

### Changed
- Replaced the single-threaded `php artisan serve` in the backend `Dockerfile` with a production-ready FrankenPHP base image (`dunglas/frankenphp:1.4-php8.4-alpine`).
- Updated the backend `Dockerfile` to expose port 8000 and run the `php artisan octane:start` command by default.
- Modified `compose.yaml` to include the `OCTANE_SERVER=frankenphp` environment variable for the backend service.
