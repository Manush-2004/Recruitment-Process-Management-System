# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


<!-- ## Recruiter pages (new)
This project now includes a basic **Recruiter** UI under `src/pages/recruiter/` implementing:

- `RecruiterDashboard` — quick metrics and live notifications
- `JobsPage` (+ `JobForm`) — create/update/delete jobs and manage required skills
- `JobCandidates` — view auto-linked candidates and skill-match visualization
- `CandidatesPage` — create candidate (multipart), upload CV, and bulk Excel upload
- `ScreeningPage` — assign reviewer, approve skills, and set screening status. Accessible from the recruiter navigation menu and from `Assign Screening` actions on the Jobs / Candidates lists; the page supports pre-filling candidate and job via query parameters (e.g. `/recruiter/screening?candidateId=123&jobId=456`).

Reviewer role pages (new):
- `ReviewerDashboard` — assigned screenings and quick actions
- `Reviewer Screening` — view candidate CV, skill-by-skill evaluation, experience input, comments, and submit screening (validated and restricted to `Reviewer` role)
- `ScreeningHistory` — past screenings submitted by the reviewer with status audit trail

Security & validation:
- `Reviewer` routes are protected via `ProtectedRoute` and require the `Reviewer` role
- Duplicate screening checks are performed via `/api/screenings/check` before submission
- Status-based validation (e.g., `Shortlisted` requires at least one approved skill) is enforced client-side
- `InterviewScheduling` — schedule interviews with panel support
- `OfferManagement` — fetch interview summaries and initiate offer requests (HR-only endpoints may reject creation)

Dev helper: `test/frontend-recruiter-flow-test.mjs` — a small mocked test verifying the recruiter API client (run with `node test/frontend-recruiter-flow-test.mjs`).

Notes:
- Routes are protected with role-based checks; only users with the `Recruiter` role can access `/recruiter/*` routes.
- SignalR notifications are available via the shared `NotificationContext` and shown in the dashboard.
- Some backend endpoints (e.g., global interviews or offers listing) are not available; UI will show a placeholder when counts are not computable. -->