# CodeScope

AI-powered GitHub repository analysis — ask questions about any codebase in plain English and get answers grounded in the actual code.

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000000)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)

## Overview

CodeScope ingests a GitHub repository, maps its file structure, and exposes an AI chat interface so developers can explore an unfamiliar codebase without reading every file line by line.

## Features

- GitHub repo ingestion with filtering and size limits
- Interactive repository / file structure explorer
- AI-powered Q&A grounded in the actual codebase
- JWT authentication with bcrypt password hashing
- Asynchronous, bounded file processing
- Rate limiting and Helmet-based security middleware

## Performance

| Metric | Result |
|---|---|
| Files processed | 200+ |
| Lines of code analyzed | 25,000+ |
| Ingestion time | 18.9s → 2.5s (~87% faster) |
| Load test | 50,000 requests, 200 concurrent clients |
| Throughput | 3,400+ req/s |
| Latency (median / p95) | 53ms / 106ms |
| Error rate | 0% |

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Axios |
| Backend | Node.js, Express, JWT, bcrypt, Helmet |
| Database | MongoDB, Mongoose |
| APIs | GitHub REST API, OpenAI API |

## Architecture

```
React / Vite  →  Express API  →  Auth / Repo Analysis / AI Chat
                      │
     Routes → Middleware → Controllers → Services → DB / External APIs
```

Layered architecture keeps HTTP handling separate from business logic, making the app easier to test and maintain.

## Getting Started

```bash
git clone https://github.com/AdamTabakov/CodeScope.git
cd CodeScope

# Backend
cd backend
npm install
# create a .env file with MongoDB, JWT, GitHub, and OpenAI credentials
# (see backend/.env.example for all variables, including CORS_ORIGINS)
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
# create a frontend/.env with VITE_API_URL pointing at the backend origin
# e.g. VITE_API_URL=http://localhost:3000
npm run dev
```

## Deployment

### Backend (Render)

1. Push the repo to GitHub and create a **Web Service** on [Render](https://render.com) pointing at the `backend/` directory.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set the following **environment variables**:

   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | Your MongoDB connection string (Atlas or local) |
   | `JWT_SECRET` | Long random string — never share or commit it |
   | `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_EMAIL` | Admin account seed values |
   | `CORS_ORIGINS` | Your deployed frontend origin, e.g. `https://codescope-4yq.pages.dev` |
   | `APP_URL` | Your deployed frontend URL (used in email verification links) |
   | `RESEND_API_KEY` | Resend API key (email verification) |
   | `EMAIL_FROM` | `CodeScope <onboarding@resend.dev>` or a verified sending domain |

   Add `NODE_ENV=production` so errors are never exposed to clients.

### Frontend (Cloudflare Pages)

1. Create a **Cloudflare Pages** project connected to the repo, root = `frontend/`.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Add the environment variable **`VITE_API_URL`** = your Render backend URL, e.g. `https://your-app.onrender.com`. Vite inlines it at build time, so set it as a **production** variable and redeploy after any change.
5. Add `NODE_VERSION` (e.g. `20`) if the default build environment is too old.

> The backend's `CORS_ORIGINS` must list the Cloudflare origin exactly (no trailing slash), and `VITE_API_URL` must point at the Render origin (no trailing slash, no `/api` suffix).

## Security

- Passwords hashed with bcrypt
- JWT-based auth with login rate limiting
- Helmet security headers and request body limits
- Server-side API credentials and input validation

## Roadmap

- Repository scan caching
- Background processing for large repos
- Code-aware / semantic retrieval with symbol-level indexing
- Production observability
- Expanded automated testing

## Author

**Adam Tabakov** —  @ Toronto Metropolitan University

[GitHub](https://github.com/AdamTabakov/CodeScope) · [LinkedIn](https://www.linkedin.com/in/adam-tabakov-85280b319/)
