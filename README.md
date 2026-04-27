# Content Broadcasting System — Backend API

A Node.js/Express REST API for managing and broadcasting digital content across display devices in an educational institution. Teachers upload content; a principal reviews, approves, and schedules it into display slots.

---

## Tech Stack

Runtime: Node.js 24 (TypeScript) 
Framework: Express 5
Database: PostgreSQL
File Storage: AWS S3
Auth: JWT (access + refresh token rotation)
Validation: Zod v4
Security: Helmet, HPP, CORS, CSRF double-submit 

---

## Architecture Overview

```
src/
├── config/         # DB pool, S3 client, secrets loader
├── controllers/    # Thin request/response handlers
├── middlewares/    # Auth, CSRF, error, upload, validate
├── migrations/     # Raw SQL migrations
├── models/         # SQL queries
├── routes/         # Express routers
├── services/       # Business logic
├── types/          # Shared TypeScript interfaces
├── utils/          # JWT, cookies, hashing, S3 helpers, logger
└── validators/     # Zod schemas
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL database
- AWS account with an S3 bucket

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in real values:

```bash
cp .env.example .env   # or edit .env directly
```

Required variables:

```env
PORT=8080
NODE_ENV=development

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gurpac
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword

# JWT — must be long random strings and MUST differ from each other
JWT_ACCESS_SECRET=change_me_access
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_refresh
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_TTL_DAYS=7

# Cookies
COOKIE_SECURE=false      
COOKIE_DOMAIN=     

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=your-bucket
```

### 3. Run migrations

```bash
npm run migrate
```

### 4. Seed the principal account

The `principal` role **cannot self-register** via the API (only teachers can). Create the first principal account by setting these vars in `.env` and running:

```env
SEED_PRINCIPAL_EMAIL=principal@school.edu
SEED_PRINCIPAL_PASSWORD=StrongPassword123
SEED_PRINCIPAL_NAME=School Principal
```

```bash
npm run seed
```

The script is idempotent — running it again on an existing email is a no-op.

### 5. Start the server

```bash
npm run dev      # development (nodemon + ts-node)
npm run build    # compile to dist/
npm start        # run compiled build
```

---


## API Reference

Full API documentation is available in two formats:

- **OpenAPI spec** — [`openapi.yaml`](openapi.yaml) — import into [Swagger UI](https://swagger.io/tools/swagger-ui/), Stoplight, or any OpenAPI-compatible viewer for interactive docs.
- **Postman collection** — [`Content Broadcasting System.postman_collection.json`](Content%20Broadcasting%20System.postman_collection.json) — import into Postman to get all endpoints with example request bodies and saved responses ready to run.

---


## Database Schema

```
users               — accounts (teacher | principal)
content             — uploaded files + metadata + approval state
content_slots       — named display positions (one per subject)
content_schedule    — maps approved content → slot with rotation order
refresh_tokens      — hashed refresh tokens with family reuse detection
```

Migrations are in `src/migrations/` and run in filename order via `npm run migrate`.

---

## Limitations

This implementation has a few known limitations that would need to be addressed before using it in a production environment:

- **Single principal account** — At the moment, there’s no admin panel or API to manage principals. The `npm run seed` script creates one default account, and any additional principals have to be added manually to the database.

- **Pre-signed URL expiry** — Content `file_url` values expire after one hour. For long-running display setups like kiosks or TVs, the client needs to periodically call `/api/schedule/active` to refresh the URL. Otherwise, the content will stop loading once it expires.

- **No file versioning** — Every upload creates a new content record. There’s no way to update or replace an existing file, and old S3 objects are not removed when content is rejected or taken out of the schedule.

- **No email verification** — Teacher accounts are activated immediately after registration. There’s no email verification step, so anyone with a valid email format can sign up.

- **No pagination on slots** — The `GET /api/slots` endpoint currently returns all slots in a single response. This works fine for smaller datasets but would need pagination as the data grows.

- **Unauthenticated broadcast endpoint** — The `GET /api/schedule/active` endpoint is intentionally public since display devices don’t handle authentication. However, this also means it’s openly accessible, so in a production setup, it should be restricted using network-level controls.



