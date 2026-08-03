# EA-HTS Summit Platform

Enterprise event management platform for the East Africa Health Technology Summit (EA-HTS). The system supports the full summit lifecycle, from public-facing event information and participant registration to admin operations, communications, finance, programme management, and partner coordination.

## Project Overview

EA-HTS Summit Platform is a full-stack application built with React and Node.js. It is organized into a separate frontend experience for public and admin users, a backend API for business logic and integrations, and a Supabase-backed data layer for persistence and migrations.

### Core capabilities

- Public website and event information
- Participant registration flow
- Automated email communication
- Admin Command Center
- Access management and secure admin onboarding
- Programme, partner, finance, and operations foundations
- Audit logging and platform administration

---

## Architecture

The repository is split into three main areas:

```text
frontend/   React + TypeScript + Vite application
backend/    Node.js + Express API service
supabase/   Database schema and migrations
```

### Frontend

The frontend contains the public site, registration experience, and browser-based admin UI. It is built with React, TypeScript, Vite, and a shared component-based design system.

Structure:

```text
frontend/
  public/
  src/
    components/
    contexts/
    layouts/
    pages/
    routes/
    services/
    styles/
    utils/
```

### Backend

The backend provides the API layer for authentication, registration processing, email delivery, admin authorization, and service integrations. It is designed to remain independently maintainable from the frontend.

Structure:

```text
backend/
  src/
    controllers/
    routes/
    services/
    middleware/
    lib/
    types/
```

### Database

Supabase is used as the persistence and integration layer. Schema and migration files live under:

```text
supabase/
  schema.sql
  migrations/
```

---

## Main Modules

### Registration System

Implemented features include:

- Participant registration workflow
- Form handling and validation
- Confirmation flow
- Registration processing integration

### Communication Center

Implemented foundations include:

- Email service integration
- Email templates
- Queue-driven communication handling
- Logging and delivery support

### Admin Command Center

The admin area provides a secure workspace for:

- Protected admin authentication
- Access and role management foundations
- Invitation-based onboarding support
- Programme, partner, finance, and operations administration

---

## Running the Project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Build for production:

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Build for production:

```bash
cd backend
npm run build
```

---

## Environment Configuration

Create environment files before starting the services:

- Frontend: `frontend/.env`
- Backend: `backend/.env`

The backend expects the following variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `FRONTEND_URL`
- `PORT` (optional, defaults to `4000`)

The frontend should be configured with the API base URL as needed for your local or deployed environment.

---

## Development Workflow

Recommended workflow:

1. Start the backend API.
2. Start the frontend development server.
3. Make changes in the relevant module area.
4. Verify builds before pushing changes.

Validation commands:

```bash
cd frontend && npm run build
cd ../backend && npm run build
```

---

## Current Status

Completed areas include:

- Public-facing website structure
- Registration experience
- Email delivery foundation
- Admin Command Center foundation
- Authentication and access management foundation
- Programme, partner, finance, and operations module scaffolding
- Frontend architecture restructuring

---

## Notes

The project follows a clear separation of concerns:

- Frontend handles presentation and user interaction
- Backend handles business logic, security, and integrations
- Supabase manages persistence and schema evolution

