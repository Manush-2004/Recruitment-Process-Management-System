# Recruitment Process Management System (RPMS)

A comprehensive full-stack recruitment management platform that streamlines the entire hiring workflow from job posting to offer generation. Built with ASP.NET Core 9.0 and React 19, featuring role-based access control, real-time notifications, and automated document generation.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Frontend](#frontend)
- [Backend](#backend)
- [Roles & Responsibilities](#roles--responsibilities)
- [End-to-End Test Scripts](#end-to-end-test-scripts)
- [Running the Full Stack](#running-the-full-stack)
- [Environment & Configuration](#environment--configuration)

---

## Project Overview

The Recruitment Process Management System (RPMS) is a production-ready application that manages the complete recruitment lifecycle:

- **Job Management**: Create, update, and publish job openings with skill requirements
- **Candidate Tracking**: Manage candidate profiles, documents, and application status
- **Screening Workflow**: Assign and track candidate screenings with skill assessments
- **Interview Scheduling**: Schedule multi-round interviews with automated notifications
- **Feedback Collection**: Collect and aggregate interviewer feedback
- **Offer Generation**: Generate PDF offer letters with customizable templates
- **Real-time Notifications**: SignalR-powered instant updates for all stakeholders
- **Role-based Access**: Six distinct roles with granular permissions
- **Document Management**: Upload, verify, and manage candidate documents
- **Reporting & Analytics**: Position-wise and technology-wise candidate analytics

---

## Project Structure

```
Recruitment System/
├── RecruitmentSystemAPI/              # Backend (ASP.NET Core 9.0)
│   ├── Controllers/                   # API endpoints
│   │   ├── AuthController.cs          # Authentication (register, login)
│   │   ├── JobsController.cs          # Job CRUD operations
│   │   ├── CandidatesController.cs    # Candidate management
│   │   ├── ScreeningsController.cs    # Screening workflow
│   │   ├── InterviewsController.cs    # Interview scheduling
│   │   ├── FeedbackController.cs      # Interview feedback
│   │   ├── OffersController.cs        # Offer generation
│   │   ├── AdminController.cs         # User/role management
│   │   ├── ReportsController.cs       # Analytics endpoints
│   │   └── UsersController.cs         # User queries
│   ├── Services/                      # Business logic layer
│   │   ├── AuthService.cs             # JWT authentication
│   │   ├── CandidateService.cs        # Candidate operations
│   │   ├── JobService.cs              # Job operations
│   │   ├── ScreeningService.cs        # Screening logic
│   │   ├── InterviewService.cs        # Interview scheduling
│   │   ├── FeedbackService.cs         # Feedback aggregation
│   │   ├── OfferService.cs            # PDF offer generation
│   │   ├── NotificationService.cs     # SignalR notifications
│   │   ├── StatusService.cs           # Status tracking
│   │   ├── AdminService.cs            # Admin operations
│   │   └── EmailService.cs            # Email notifications
│   ├── Models/                        # Data models and DTOs
│   ├── Data/                          # EF Core DbContext
│   ├── Hubs/                          # SignalR hubs
│   │   └── NotificationHub.cs         # Real-time notifications
│   ├── Validators/                    # FluentValidation rules
│   ├── Migrations/                    # EF Core migrations
│   ├── wwwroot/                       # Static files
│   │   ├── uploads/cvs/               # Candidate CVs
│   │   └── offers/                    # Generated offer PDFs
│   └── Program.cs                     # Application entry point
│
└── recruitment-system/                # Frontend (React 19 + Vite)
    ├── src/
    │   ├── api/                       # API client modules
    │   │   ├── authApi.js             # Authentication
    │   │   ├── candidatesApi.js       # Candidate endpoints
    │   │   ├── recruiterApi.js        # Recruiter endpoints
    │   │   ├── reviewerApi.js         # Reviewer endpoints
    │   │   ├── interviewerApi.js      # Interviewer endpoints
    │   │   ├── hrApi.js               # HR endpoints
    │   │   ├── adminApi.js            # Admin endpoints
    │   │   └── axiosConfig.js         # Axios instance with interceptors
    │   ├── components/                # Reusable UI components
    │   │   ├── NavigationBar.jsx      # Role-based navigation
    │   │   ├── ProtectedRoute.jsx     # Route guards
    │   │   ├── StatusTimeline.jsx     # Status history visualization
    │   │   └── ...
    │   ├── contexts/                  # React contexts
    │   │   ├── AuthContext.jsx        # Authentication state
    │   │   └── NotificationContext.jsx # SignalR notifications
    │   ├── pages/                     # Page components
    │   │   ├── candidate/             # Candidate dashboard, profile, documents
    │   │   ├── recruiter/             # Job management, screening, interviews
    │   │   ├── reviewer/              # Screening dashboard and workflow
    │   │   ├── interviewer/           # Interview feedback submission
    │   │   ├── hr/                    # HR interviews, offers, document verification
    │   │   └── admin/                 # User management, reports
    │   ├── config/                    # Configuration files
    │   └── main.jsx                   # Application entry point
    └── test/                          # E2E test scripts
        ├── test-e2e.cjs               # Basic candidate flow
        ├── recruiter-e2e.cjs          # Recruiter workflow
        ├── reviewer-e2e.cjs           # Reviewer workflow
        ├── interviewer-e2e.cjs        # Interviewer workflow
        ├── hr-e2e.cjs                 # HR workflow
        ├── admin-e2e.cjs              # Admin workflow
        └── mock-server/               # Mock backend for frontend testing
```

---

## Frontend

### Tech Stack

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.11.0
- **Styling**: Tailwind CSS 3.4.17
- **HTTP Client**: Axios 1.12.2
- **Real-time**: @microsoft/signalr 10.0.0
- **Form Handling**: React Hook Form 7.65.0
- **Authentication**: JWT (jsonwebtoken, jwt-decode)

### Implemented Features

#### Authentication & Authorization
- JWT-based authentication with token storage in localStorage
- Role-based route protection with `ProtectedRoute` component
- Automatic token refresh and logout on expiration
- Axios interceptors for automatic token injection

#### Role-Based Dashboards
- **Candidate Dashboard**: View applied jobs, interviews, offers, and status history
- **Recruiter Dashboard**: Manage jobs, candidates, screenings, and interviews
- **Reviewer Dashboard**: View assigned screenings and submission history
- **Interviewer Dashboard**: View assigned interviews and submit feedback
- **HR Dashboard**: Manage HR-stage candidates, schedule interviews, generate offers
- **Admin Dashboard**: User management, role assignment, system reports

#### Core Features
- **Job Browsing**: Search and filter jobs with skill requirements
- **Application Management**: Apply for jobs, track application status
- **Document Upload**: Upload CVs and supporting documents (PDF, DOC, DOCX)
- **Bulk Upload**: Excel-based bulk candidate import
- **Screening Workflow**: Assign reviewers, evaluate skills, approve/reject candidates
- **Interview Scheduling**: Multi-round interviews with interviewer assignment
- **Feedback System**: Skill-based ratings and comments
- **Offer Generation**: Automated PDF offer letter creation
- **Real-time Notifications**: SignalR-powered instant updates
- **Status Timeline**: Visual representation of candidate journey

#### API Services
All API interactions are centralized in dedicated service modules:
- `authApi.js`: Register, login
- `candidatesApi.js`: Profile, documents, interviews, offers, status history
- `recruiterApi.js`: Jobs, candidates, screenings, interviews
- `reviewerApi.js`: Assigned screenings, screening history
- `interviewerApi.js`: Assigned interviews, feedback submission
- `hrApi.js`: HR-stage candidates, interviews, offers, document verification
- `adminApi.js`: Users, roles, reports
- `usersApi.js`: User queries by role

### How to Run Locally

1. **Install Dependencies**
   ```bash
   cd recruitment-system
   npm install
   ```

2. **Configure Environment** (Optional)
   Create a `.env` file if you need to override the default API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5190
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   ```
   Production files will be in the `dist/` folder

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

---

## Backend

### Tech Stack

- **Framework**: ASP.NET Core 9.0
- **Database**: Entity Framework Core 9.0.8 with SQL Server
- **Authentication**: JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer 9.0.0)
- **Real-time**: SignalR (Microsoft.AspNetCore.SignalR 1.2.0)
- **Validation**: FluentValidation.AspNetCore 11.3.1
- **Password Hashing**: BCrypt.Net-Next 4.0.3
- **Excel Processing**: EPPlus 6.1.2
- **PDF Generation**: QuestPDF 2025.12.0
- **API Documentation**: Swashbuckle.AspNetCore 7.0.0

### Authentication & Authorization

#### JWT Configuration
- **Issuer**: RecruitmentSystem
- **Audience**: RecruitmentSystemUsers
- **Token Lifetime**: Configurable (default: 1 hour)
- **Signing Key**: Configured in `appsettings.json`
- **Claims**: Email (unique_name), FullName, Roles

#### Roles
- **Candidate**: Apply for jobs, manage profile
- **Recruiter**: Manage jobs, candidates, assign screenings
- **Reviewer**: Perform candidate screenings
- **Interviewer**: Submit interview feedback
- **HR**: Schedule HR interviews, verify documents, generate offers
- **Admin**: Full system access, user/role management

### Implemented Controllers

#### AuthController (`/api/auth`)
- `POST /register`: User registration with role assignment
- `POST /login`: Authentication with JWT token generation

#### JobsController (`/api/jobs`)
- `GET /`: List all jobs (with optional candidate-specific status)
- `GET /{id}`: Get job details
- `POST /`: Create new job (Recruiter/Admin)
- `PUT /{id}`: Update job (Recruiter/Admin)
- `DELETE /{id}`: Delete job (Recruiter/Admin)
- `POST /{id}/apply`: Apply for job (Candidate)

#### CandidatesController (`/api/candidates`)
- `GET /`: List all candidates
- `GET /{id}`: Get candidate details
- `POST /`: Create candidate with CV upload
- `POST /bulk`: Bulk import from Excel
- `GET /me`: Get authenticated candidate profile
- `PATCH /me`: Update candidate profile
- `GET /me/interviews`: Get candidate's interviews
- `GET /me/offers`: Get candidate's offers
- `GET /me/status-history`: Get status change history
- `POST /me/documents`: Upload document
- `POST /me/skills`: Add skills
- `PATCH /me/skills`: Update skills
- `GET /hr-stage`: Get candidates at HR stage (HR only)
- `POST /{candidateId}/documents/{documentId}/verify`: Verify document (HR only)

#### ScreeningsController (`/api/screenings`)
- `GET /assigned`: Get assigned screenings (Reviewer)
- `GET /history`: Get screening history (Reviewer)
- `GET /for-candidate/{candidateId}`: Get screenings for candidate
- `GET /check`: Check if candidate already screened
- `POST /`: Submit screening (Reviewer)
- `POST /assign`: Assign screening to reviewer (Recruiter/Admin)
- `PATCH /{id}`: Update screening

#### InterviewsController (`/api/interviews`)
- `POST /`: Schedule interview (Recruiter/HR)

#### FeedbackController (`/api/feedback`)
- `POST /`: Submit interview feedback (Interviewer)
- `GET /interview/{interviewId}/summary`: Get feedback summary (HR)

#### OffersController (`/api/offers`)
- `POST /`: Generate offer with PDF (HR only)

#### AdminController (`/api/admin`)
- `GET /users`: List all users
- `POST /users`: Create user
- `PUT /users/{id}`: Update user
- `POST /users/{id}/roles`: Assign role to user
- `DELETE /users/{id}/roles/{role}`: Remove role from user
- `GET /roles`: List all roles
- `POST /roles`: Create role
- `POST /clear-users`: Clear all users (development helper)

#### ReportsController (`/api/reports`)
- `GET /position-wise`: Position-wise candidate distribution
- `GET /technology-wise`: Technology-wise candidate distribution
- `GET /candidates/summary`: Candidate summary statistics
- `GET /interviewer-summary`: Interviewer performance summary

#### UsersController (`/api/users`)
- `GET /`: Get users (with optional role filter)

### Implemented Services

- **AuthService**: User registration, login, JWT generation, password hashing
- **CandidateService**: CRUD operations, document upload, bulk import, skill management
- **JobService**: Job CRUD, candidate application tracking
- **ScreeningService**: Screening workflow, skill evaluation, status updates
- **InterviewService**: Interview scheduling with email notifications
- **FeedbackService**: Feedback submission, aggregation, summary generation
- **OfferService**: PDF offer letter generation with QuestPDF
- **NotificationService**: SignalR-based real-time notifications
- **StatusService**: Candidate status tracking and history
- **AdminService**: User/role management, system cleanup
- **EmailService**: Email notifications (placeholder implementation)

### SignalR Implementation

#### NotificationHub (`/hubs/notifications`)
- **Purpose**: Real-time notifications for status changes, assignments, and system events
- **Methods**:
  - `SendNotification(string message)`: Broadcast to all clients
  - `ReceiveNotification`: Client-side handler
- **Usage**: Automatic notifications on:
  - Candidate status changes
  - Screening assignments
  - Interview scheduling
  - Offer generation
  - System events (e.g., user clearance)

### File Uploads

- **CV Upload**: Stored in `wwwroot/uploads/cvs/`
- **Document Upload**: Stored in `wwwroot/uploads/`
- **Offer PDFs**: Generated in `wwwroot/offers/`
- **Size Limits**: 20MB for CVs/documents, 50MB for bulk uploads
- **Supported Formats**: PDF, DOC, DOCX for documents; XLSX, XLS for bulk import

### Database Migrations

The system includes 7 migrations tracking the evolution of the schema:
1. `InitialCreate`: Jobs and required skills
2. `AddCandidatesAndDocuments`: Candidate profiles and documents
3. `AddCandidateSkillsAndLinks`: Candidate skills and job applications
4. `AddScreeningModule`: Screening workflow
5. `AddUsersAndRoles`: Authentication and authorization
6. `AddCandidateDocumentFields`: Document verification fields
7. `AddInterviewResultField`: Interview result tracking

### How to Run Locally

1. **Prerequisites**
   - .NET 9.0 SDK
   - SQL Server (LocalDB or full instance)
   - Visual Studio 2022 or VS Code (optional)

2. **Configure Database**
   Update `appsettings.json` with your SQL Server connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=RecruitmentSystemDb;Trusted_Connection=true;TrustServerCertificate=true"
     }
   }
   ```

3. **Apply Migrations**
   ```bash
   cd RecruitmentSystemAPI
   dotnet ef database update
   ```

4. **Run the API**
   ```bash
   dotnet run
   ```
   The API will start on:
   - HTTP: `http://localhost:5190`
   - HTTPS: `https://localhost:7190`

5. **Access Swagger UI**
   Open `http://localhost:5190/swagger/index.html` to explore and test API endpoints

6. **Build for Production**
   ```bash
   dotnet publish -c Release
   ```

---

## Roles & Responsibilities

### Candidate
**Access**: Own profile, applied jobs, interviews, offers

**Capabilities**:
- Register and create profile
- Browse and apply for jobs
- Upload CV and supporting documents
- View application status and history
- View scheduled interviews
- View and accept/reject offers
- Receive real-time notifications

**Key Pages**: Dashboard, Profile, Documents, Interviews, Offers, Notifications

---

### Recruiter
**Access**: Jobs, candidates, screenings, interviews

**Capabilities**:
- Create, update, and delete job postings
- Add candidates manually or via bulk Excel upload
- Assign candidates to reviewers for screening
- Perform direct screening (without reviewer assignment)
- Schedule technical/HR interviews
- View screening results and feedback
- Track candidate pipeline

**Key Pages**: Dashboard, Jobs, Candidates, Screening, Interview Scheduling

---

### Reviewer
**Access**: Assigned screenings

**Capabilities**:
- View assigned candidate screenings
- Evaluate candidate skills against job requirements
- Approve/reject candidates with comments
- Update screening status
- View screening history

**Key Pages**: Dashboard, Screening (assigned), History

---

### Interviewer
**Access**: Assigned interviews

**Capabilities**:
- View assigned interviews
- Submit interview feedback
- Rate candidates on technical skills
- Provide overall recommendations
- View feedback submission history

**Key Pages**: Dashboard, Interview Details, Feedback Submission

---

### HR
**Access**: HR-stage candidates, interviews, offers, document verification

**Capabilities**:
- View candidates who passed technical rounds
- Schedule HR interviews
- View aggregated interview feedback
- Verify candidate documents
- Generate and send offer letters (PDF)
- Track offer acceptance/rejection
- Move candidates through HR pipeline

**Key Pages**: Dashboard, HR Candidates, Interviews, Offers, Document Verification

---

### Admin
**Access**: Full system access

**Capabilities**:
- Create and manage users
- Assign/remove roles
- Create custom roles
- View system-wide reports:
  - Position-wise candidate distribution
  - Technology-wise candidate distribution
  - Candidate summary statistics
  - Interviewer performance metrics
- Clear all users (development helper)
- Access all endpoints

**Key Pages**: Dashboard, User Management, Role Management, Reports

---

## End-to-End Test Scripts

All test scripts are located in `recruitment-system/test/` and can be run with Node.js.

### Test Scripts Overview

#### 1. `test-e2e.cjs` - Basic Candidate Flow
**Purpose**: Tests core candidate functionality

**Flow**:
- Register as Candidate
- Login and get JWT token
- Create candidate profile
- Get profile (`/api/candidates/me`)
- Browse jobs
- Apply for a job
- Upload document
- View status history

**Run**: `node test/test-e2e.cjs`

---

#### 2. `recruiter-e2e.cjs` - Recruiter Workflow
**Purpose**: Tests recruiter operations

**Flow**:
- Register as Recruiter
- Login
- Create job posting
- Create candidate (with CV upload)
- Assign screening to reviewer
- Schedule interview

**Run**: `npm run e2e:recruiter`

---

#### 3. `reviewer-e2e.cjs` - Reviewer Workflow
**Purpose**: Tests screening workflow

**Flow**:
- Register as Reviewer
- Login
- View assigned screenings
- Submit screening with skill evaluation
- View screening history

**Run**: `npm run e2e:reviewer`

---

#### 4. `interviewer-e2e.cjs` - Interviewer Workflow
**Purpose**: Tests interview feedback submission

**Flow**:
- Register as Interviewer
- Login
- View assigned interviews
- Submit feedback with skill ratings
- View feedback history

**Run**: `npm run e2e:interviewer`

---

#### 5. `hr-e2e.cjs` - HR Workflow
**Purpose**: Tests HR operations

**Flow**:
- Register as HR
- Login
- Create candidate and job
- Screen candidate (move to HR stage)
- Schedule HR interview
- Submit interviewer feedback
- View feedback summary
- Generate offer (PDF)

**Run**: `npm run e2e:hr`

---

#### 6. `admin-e2e.cjs` - Admin Workflow
**Purpose**: Tests admin operations

**Flow**:
- Register as Admin
- Login
- Get all users
- Create new user
- Assign role to user
- Get all roles
- View reports

**Run**: `npm run e2e:admin`

---

### Running All Tests

```bash
cd recruitment-system
npm run e2e:all
```

This runs all E2E tests sequentially: HR → Interviewer → Recruiter → Reviewer → Admin

### Mock Server

A mock backend server is available for frontend-only testing:

```bash
cd recruitment-system/test/mock-server
npm install
npm start
```

The mock server runs on `http://localhost:5190` and provides:
- Authentication endpoints
- Candidate profile endpoints
- Basic CRUD operations
- JWT token generation

---

## Running the Full Stack

### Development Mode

1. **Start Backend**
   ```bash
   cd RecruitmentSystemAPI
   dotnet run
   ```
   Backend runs on `http://localhost:5190`

2. **Start Frontend** (in a new terminal)
   ```bash
   cd recruitment-system
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

3. **Access Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5190`
   - Swagger UI: `http://localhost:5190/swagger/index.html`
   - SignalR Hub: `http://localhost:5190/hubs/notifications`

### Production Deployment

1. **Build Backend**
   ```bash
   cd RecruitmentSystemAPI
   dotnet publish -c Release -o ./publish
   ```

2. **Build Frontend**
   ```bash
   cd recruitment-system
   npm run build
   ```
   Static files will be in `dist/`

3. **Deploy**
   - Backend: Deploy `publish/` folder to IIS, Azure App Service, or Docker
   - Frontend: Deploy `dist/` folder to static hosting (Netlify, Vercel, Azure Static Web Apps)
   - Update `VITE_API_BASE_URL` in frontend to point to production backend

---

## Environment & Configuration

### Backend Configuration

**appsettings.json**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=RecruitmentSystemDb;Trusted_Connection=true;TrustServerCertificate=true"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY_HERE_MINIMUM_32_CHARACTERS",
    "Issuer": "RecruitmentSystem",
    "Audience": "RecruitmentSystemUsers"
  }
}
```

**Ports**:
- HTTP: `5190`
- HTTPS: `7190`

**CORS**: Configured to allow `http://localhost:3000` (frontend dev server)

**File Storage**:
- CVs: `wwwroot/uploads/cvs/`
- Documents: `wwwroot/uploads/`
- Offers: `wwwroot/offers/`

### Frontend Configuration

**Environment Variables** (`.env`):
```
VITE_API_BASE_URL=http://localhost:5190
```

**Ports**:
- Development: `3000`
- Preview: `4173`

### Database

**Provider**: SQL Server (LocalDB or full instance)

**Connection String**: Configured in `appsettings.json`

**Migrations**: 7 migrations tracking schema evolution

**Tables**:
- Jobs, RequiredSkills
- Candidates, CandidateDocuments, CandidateSkills, CandidateJobs
- Screenings, ScreeningSkills
- Interviews, Interviewers, InterviewFeedback, FeedbackSkills
- Offers
- Users, Roles, UserRoles
- StatusHistories

### Ignored Files

**Backend** (`.gitignore`):
- `bin/`, `obj/`
- `*.user`, `*.suo`
- `appsettings.Development.json` (if contains secrets)
- `wwwroot/uploads/`, `wwwroot/offers/`

**Frontend** (`.gitignore`):
- `node_modules/`
- `dist/`
- `.env.local`, `.env.production.local`

---

## Notes

- **JWT Tokens**: Stored in `localStorage` on the frontend. Automatically included in all API requests via Axios interceptors.
- **SignalR**: Automatically reconnects on connection loss. Notifications are displayed in real-time across all connected clients.
- **FluentValidation**: All request DTOs are validated on the backend. Validation errors return 400 Bad Request with detailed messages.
- **Password Security**: Passwords are hashed using BCrypt with salt rounds configured in `AuthService`.
- **File Upload Security**: File types and sizes are validated. Files are stored with GUID-based names to prevent conflicts.
- **PDF Generation**: Offer letters are generated using QuestPDF with customizable templates.
- **Excel Import**: Bulk candidate import supports XLSX/XLS files with predefined column structure.
- **Status Tracking**: All candidate status changes are logged in `StatusHistories` with timestamps and actor information.
- **Real-time Updates**: Status changes, assignments, and system events trigger SignalR notifications to relevant users.

---

## License

This project is for educational and demonstration purposes.
