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
- Client services for API calls (`axios`) and SignalR client for notifications
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
- Controllers: `AuthController`, `JobsController`, `CandidatesController`, `InterviewsController`, `FeedbackController`, `OffersController`, `ScreeningsController`
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
- Frontend: Login, Signup, Dashboard, routing, API client and SignalR integration scaffolded and partially implemented.
- Backend: Core controllers and services implemented; migrations and upload handling in place; JWT auth and SignalR configured.

---

## Contributing & running the full stack 🚀
- Start the backend (`RecruitmentSystemAPI`) first so the frontend can connect to the API endpoints and SignalR hub.
- Frontend dev server runs separately (`recruitment-system`), and proxies or CORS should be configured if necessary.
- If you add environment-specific files or local configuration, include an example template (e.g., `.env.example`) so collaborators know required keys.

---

If you'd like, I can add a short `.env.example` or `README` sections for running migrations, seeding data, or CI steps. Let me know which you'd prefer next.