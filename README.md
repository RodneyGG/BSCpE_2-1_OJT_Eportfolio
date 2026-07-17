# BSCpE 2-1 OJT E-Portfolio

A full-stack OJT (On-the-Job Training) E-Portfolio web application for BSCpE 2-1 students. Built with Next.js 16 + React 19 + TypeScript.

## Features
- **Student Profile Dashboard**: Track logged hours (up to 300), view active status, upload custom avatars, and edit profile details dynamically.
- **Weekly Journal & DTR System**: Log Daily Time Records (DTR) and submit weekly journals.
- **Admin & Coordinator View**: A dedicated `/admin` dashboard to monitor student progress, review logged hours, and approve or reject document submissions.
- **Mock Authentication System**: Dedicated login portal with specific roles (Student vs. Admin).
- **Automated CI/CD**: Seamless automated deployments to GitHub Pages using GitHub Actions.
## Testing / Dummy Accounts
To test the login portal and routing, please use the following dummy credentials:

**Student Account:**
- **Email**: `student@university.edu.ph`
- **Password**: `password123`

**Admin / Professor Account:**
- **Email**: `admin@university.edu.ph`
- **Password**: `admin123`

## Running Locally (Docker)

This project uses Docker to spin up the full stack seamlessly (Next.js frontend, Laravel backend, MySQL, Redis, and an Nginx reverse proxy).

1. Ensure **Docker** is installed and running on your machine.
2. In the root directory of the project, start the containers:
   ```bash
   docker compose up -d --build
   ```
3. Access the application:
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Via Nginx Proxy**: [http://localhost:8080](http://localhost:8080)

To stop the development environment, simply run:
```bash
docker compose down
```
