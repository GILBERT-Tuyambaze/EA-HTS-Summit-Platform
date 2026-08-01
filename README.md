# IEEE EA-HTS 2027

The project is split into independently runnable client and API applications.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The React/Vite application contains all public-site and browser-side admin UI code. Set `VITE_API_BASE_URL` when the API is not served from `/api`.

## Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` with the Supabase and email configuration required by the API. The backend validates Supabase access tokens and verifies that the authenticated account is an enabled administrator before serving protected `/api/admin/*` routes.

## Database

Database schema and migrations belong in `supabase/`. Apply the schema in that directory before enabling production API access.

## Verification

```bash
cd frontend && npm run build
cd ../backend && npm run build
```
