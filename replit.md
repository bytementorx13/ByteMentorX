# ByteMentorX

A production-ready tech mentorship platform by TechieSteve. Dark/futuristic UI with four service types, MongoDB Atlas storage, Gmail email notifications, and a protected admin dashboard.

## Stack

- **Frontend:** React + Vite + TypeScript, Tailwind CSS, Framer Motion, Wouter routing, TanStack Query
- **Backend:** Express.js + TypeScript, Nodemailer, express-session + memorystore
- **Database:** MongoDB Atlas (via Mongoose)

## Architecture

```
client/src/
  pages/
    Home.tsx            — Main landing page (hero, services, pricing, contact, footer)
    AdminLogin.tsx      — Admin login at /admin
    AdminDashboard.tsx  — Admin dashboard at /admin/dashboard
  components/
    ServiceModal.tsx    — Animated modal container for service forms
    forms/ServiceForms.tsx — All four service forms with live price calculation

server/
  index.ts    — Express setup with session middleware
  routes.ts   — API routes (public + admin)
  db.ts       — MongoDB connection + Mongoose RequestModel
  storage.ts  — IStorage interface + MongoStorage implementation

shared/
  schema.ts   — Zod schemas + TypeScript types
  routes.ts   — API route definitions
```

## Services & Pricing

| Service | Rate |
|---|---|
| Web Development | Custom (discussed after acceptance) |
| Consultation | ₹500 / hour |
| CS Fundamentals | ₹500 / session (max 8 sessions, 1hr each) |
| Project Guidance & Resume Review | ₹300 / session |

## Admin Panel

- URL: `/admin`
- Credentials: `admin` / `Admin@1`
- Dashboard: `/admin/dashboard`
- Features: View all requests, Accept/Reject (with email), Schedule sessions (date + time + optional meeting link), Mark as complete

## Request Status Flow

`pending` → `accepted` / `rejected` → `scheduled` → `completed`

## Environment Variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SMTP_HOST` | SMTP host (default: smtp.gmail.com) |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | Gmail address (bytementorx.13@gmail.com) |
| `SMTP_PASS` | Gmail app password |
| `SMTP_TO` | Admin notification email |
| `SESSION_SECRET` | Express session secret |

## Key Notes

- MongoDB Atlas IP whitelist must include `0.0.0.0/0` for Atlas to accept connections
- Emails are sent to the client on: accept, reject, and session scheduling
- Admin emails are sent on every new form submission
- Sessions are in-memory (MemoryStore) — admin session resets on server restart
