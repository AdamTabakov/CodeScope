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
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

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

**Adam Tabakov** — Electrical Engineering @ Toronto Metropolitan University

[GitHub](https://github.com/AdamTabakov/CodeScope) · [LinkedIn](https://www.linkedin.com/in/adam-tabakov-85280b319/)
