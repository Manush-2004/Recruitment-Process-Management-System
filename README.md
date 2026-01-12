# Recruitment-Process-Management-System

A simple recruitment management system split into a frontend (recruitment-system) and a backend (RecruitmentSystemAPI).

---

## Project structure 🔧
- `recruitment-system/` — Frontend (React + Vite)
- `RecruitmentSystemAPI/` — Backend (ASP.NET Core, .NET 9)

---

## Frontend — recruitment-system ⚡

**Tech & tooling**
- React 19, Vite, Tailwind CSS
- Key libraries: `axios`, `@microsoft/signalr`, `react-hook-form`, `react-router-dom`
- Scripts (in `recruitment-system/package.json`):
  - `npm run dev` — start dev server (Vite)
  - `npm run build` — produce production build
  - `npm run preview` — preview the production build
  - `npm run lint` — run ESLint

**What’s implemented**
- Authentication UI: **Signup** and **Login** pages
- Basic **Dashboard** page and protected routes handled via an Auth context
- Client services for API calls (`axios`) and SignalR client for notifications. Improvements: HMR and SignalR startup now include stability fixes (watch polling and retry/backoff) to reduce `net::ERR_NETWORK_CHANGED` errors in dev.
- Project scaffold with components, pages, and routes

**How to run locally**
1. cd `recruitment-system`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000` (or the port Vite reports)

Notes:
- Local env files (e.g., `.env`, `.env.local`) are ignored and should be created per developer needs using an example file if applicable.

---

## Backend — RecruitmentSystemAPI 🧩

**Tech & tooling**
- ASP.NET Core (net9.0)
- Entity Framework Core (SQL Server provider)
- JWT authentication, SignalR for real-time notifications, Swashbuckle/Swagger for API docs

**What’s implemented**
- Controllers: `AuthController`, `JobsController`, `CandidatesController`, `InterviewsController`, `FeedbackController`, `OffersController`, `ScreeningsController` — screening endpoints now include reviewer-focused reads (`/api/screenings/assigned`, `/api/screenings/history`, `/api/screenings/for-candidate`, `/api/screenings/check`) and the reviewer-only `POST /api/screenings` for submit.
- Services for business logic (e.g., `AuthService`, `CandidateService`, `OfferService`, `NotificationService`)
- SignalR hub: `NotificationHub`
- EF Core Migrations present (see `Migrations/` folder)
- File uploads stored under `wwwroot/uploads/`

**How to run locally**
1. cd `RecruitmentSystemAPI`
2. Update connection string in `appsettings.json` (or set via environment variable) to point to your SQL Server instance
3. (Optional) apply migrations: `dotnet ef database update` (requires `dotnet-ef` and configured connection string)
4. `dotnet run` (or `dotnet watch run` for hot reload)
5. API docs available at `/swagger` when the app is running in Development

Notes:
- `appsettings.Development.json` is used for local development settings (secrets, local DB). Do not commit sensitive credentials.
- Uploaded files are intentionally not tracked in Git (`wwwroot/uploads/` is ignored).

---

## Current status ✅
- Frontend: Login, Signup, Dashboard, routing, API client and SignalR integration scaffolded and fully implemented for reviewer/interviewer/HR flows. Admin UI has been added (Admin Dashboard, User Management, Role Management, Reports) and is protected by the `Admin` role.
- Backend: Core controllers and services implemented; migrations and upload handling in place; JWT auth and SignalR configured. Admin endpoints implemented in `AdminController` and `ReportsController`.

---

## Contributing & running the full stack 🚀
- Start the backend (`RecruitmentSystemAPI`) first so the frontend can connect to the API endpoints and SignalR hub.
- Frontend dev server runs separately (`recruitment-system`), and proxies or CORS should be configured if necessary.
- If you add environment-specific files or local configuration, include an example template (e.g., `.env.example`) so collaborators know required keys.

---

## Tests & developer helpers 🧪
We keep lightweight test helpers and real E2E scripts in the `test/` folder to aid development and CI checks.

- `test/hr-e2e.cjs` — Full HR end-to-end script (register HR, create candidate, upload document, verify document, schedule interview, fetch feedback summary, generate offer). Run with `node test/hr-e2e.cjs`.
- `test/interviewer-e2e.cjs` — Interviewer flow: register interviewer, create candidate, recruiter schedules interview, interviewer submits feedback and verifies duplicate checks. Run with `node test/interviewer-e2e.cjs`.
- `test/recruiter-e2e.cjs` — Recruiter flow: register recruiter, create job, create candidate, schedule interview, coordinate an interviewer to submit feedback, and validate feedback summary; checks that recruiter cannot create offers. Run with `node test/recruiter-e2e.cjs`.
- `test/reviewer-e2e.cjs` — Reviewer flow: register reviewer, submit screening, confirm history and duplicate checks. Run with `node test/reviewer-e2e.cjs`.
- `test/frontend-flow-test.mjs` — Mocked frontend tests using `axios-mock-adapter` for quick token/flow checks.
- `test/wait-and-run-real-e2e.cjs` — Poll helper that waits for the backend and then runs the real E2E script (useful in CI).

Note: These scripts run against a running backend (default URL `http://localhost:5190` used in the scripts). Ensure the API is running and migrations are applied before running the E2E scripts. They create and mutate real data in the configured database, so use a disposable DB for CI or local testing when possible.

---

<!-- **Notes & Security:**
- The registration endpoint (`POST /api/auth/register`) can create users with any requested role which is convenient for local development and E2E tests. For production, restrict admin/role creation to existing admins or a secure provisioning process and add audit logs. -->