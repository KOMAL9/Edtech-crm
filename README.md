# EdTech CRM & Inquiry System

Full-stack app for handling public inquiries and managing them through an admin dashboard. React frontend, Express backend, Supabase (Postgres) for storage.

## Features

- Public inquiry form — parents/students/schools can submit inquiries, straight into the DB
- Custom JWT auth for admin login (bcrypt for password hashing, protected routes via middleware — built from scratch, no Supabase Auth)
- Admin dashboard to view, search and filter inquiries

## Tech Stack

Frontend: React (Vite)
Backend: Node.js + Express
DB: Supabase Postgres, using `pg` directly
Auth: bcrypt + jsonwebtoken

I went with raw `pg` instead of an ORM like Prisma — the schema here is small (two tables) so it felt like unnecessary overhead for this scope.

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
3. Grab the connection string from Project Settings > Database — use the **Session Pooler** one, the direct connection kept timing out for me locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — your Supabase connection string
- `JWT_SECRET` — anything long and random
- `FRONTEND_URL` — `http://localhost:5173`

Create an admin user:
```bash
npm run create-admin -- admin@example.com "YourPassword123!"
```

Then:
```bash
npm run dev
```
Runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Opens on `http://localhost:5173`.

## Testing it out

- Go to `/` and submit an inquiry
- Log in at `/admin/login`
- On `/admin/dashboard`, try the search and the category/user-type filters
- Log out and hit `/admin/dashboard` directly — should bounce you back to login

To check the JWT auth is actually doing its job via curl:

```bash
# get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword123!"}'

# use it
curl http://localhost:5000/api/inquiries \
  -H "Authorization: Bearer <token>"
```

Without the header this should 401.

## API

| Method | Route | Auth | What it does |
|---|---|---|---|
| POST | `/api/inquiries` | — | create an inquiry |
| POST | `/api/auth/login` | — | admin login, returns JWT |
| GET | `/api/inquiries` | JWT | list inquiries, supports `?category=`, `?userType=`, `?search=` |
| GET | `/api/health` | — | health check |

## Deployment

Backend's on Render, frontend on Vercel (`VITE_API_URL` pointed at the Render URL). Nothing fancy — standard env var setup on both sides.

