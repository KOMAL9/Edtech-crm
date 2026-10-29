# EdTech CRM & Inquiry System

Full-stack app for handling public inquiries and managing them through an admin dashboard. React frontend, Express backend, Supabase (Postgres) for storage.

**Live Demo:** https://edtech-crm-rosy.vercel.app

## Features

- Public inquiry form — parents/students/schools can submit inquiries, straight into the DB
- Custom JWT auth for admin login (bcrypt for password hashing, protected routes via middleware — built from scratch, no Supabase Auth)
- Admin dashboard to view, search and filter inquiries

## Tech Stack

Frontend: React (Vite)  
Backend: Node.js + Express  
DB: Supabase Postgres, using `pg` directly  
Auth: bcrypt + jsonwebtoken

I went with raw `pg` instead of an ORM like Prisma — the schema here is small (two tables), so it felt like unnecessary overhead for this scope.

## Project Structure

```
backend/     Express API, auth middleware, DB connection
frontend/    React UI (public form + admin dashboard)
schema.sql   table definitions
```

## Running it locally

### Database

1. Spin up a project on [Supabase](https://supabase.com)
2. Open the SQL Editor and run `schema.sql`
3. Grab the connection string from the database connection settings — use the **Session Pooler** one, as the direct connection kept timing out for me locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — your Supabase connection string
- `JWT_SECRET` — a random secret of at least 32 characters
- `FRONTEND_URL` — `http://localhost:5173`
- `PORT` — `5000` (or `5001` if 5000 is occupied)

Create an admin user:

```bash
npm run create-admin -- admin@example.com "YourPassword123!"
```

Then:

```bash
npm run dev
```

Runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `frontend/.env` to match the backend port:

```env
VITE_API_URL=http://localhost:5000/api
```

If your backend runs on port 5001, change this to `http://localhost:5001/api`.

Then:

```bash
npm run dev
```

Opens on `http://localhost:5173`.

## Testing it out

- Go to `/` and submit an inquiry
- Log in at `/admin/login`
- On `/admin/dashboard`, try the search and the category/user-type filters
- Log out and hit `/admin/dashboard` directly — should bounce you back to login

To check the JWT auth via curl:

```bash
# get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword123!"}'

# use the token returned above
curl http://localhost:5000/api/inquiries \
  -H "Authorization: Bearer <token>"
```

Without the Authorization header, the protected endpoint should return 401.

These examples assume the backend is running on port 5000. Replace it with 5001 if needed.

## API

| Method | Route | Auth | What it does |
|---|---|---|---|
| POST | `/api/inquiries` | — | Create an inquiry |
| POST | `/api/auth/login` | — | Admin login, returns JWT |
| GET | `/api/inquiries` | JWT | List inquiries, supports `?category=`, `?userType=`, `?search=` |
| GET | `/api/health` | — | Health check |

## Deployment

Backend is deployed on Render, frontend on Vercel.

- **Frontend:** https://edtech-crm-rosy.vercel.app
- **Backend:** https://edtech-crm-api-nzq3.onrender.com

For the deployed frontend, `VITE_API_URL` is set to:

```env
VITE_API_URL=https://edtech-crm-api-nzq3.onrender.com/api
```

The `/api` suffix is required because the frontend appends endpoint paths like `/inquiries` and `/auth/login`.

On Render, `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL` are configured through environment variables. `FRONTEND_URL` points to the deployed Vercel site.

The database credentials and JWT secret are kept out of the repository.