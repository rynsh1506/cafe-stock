# CafeStock — SSR Procurement & Inventory Management System

![Bun](https://img.shields.io/badge/Bun-1.x-000000?style=for-the-badge&logo=bun&logoColor=white)
![ElysiaJS](https://img.shields.io/badge/ElysiaJS-1.4-6366F1?style=for-the-badge&logo=typescript&logoColor=white)
![SvelteKit](https://img.shields.io/badge/SvelteKit_5_SSR-3.1-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Docker](https://img.shields.io/badge/Docker_Compose-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**CafeStock** is a full-stack **Procurement & Inventory Management System** designed for specialty coffee roasteries and multi-branch cafes. It enforces strict role-based approvals, purchase order lifecycles, and **atomic Goods Receipt transactions** that guarantee inventory balances and movement ledgers never drift out of sync.

---

## 1. Project Overview & Monorepo Architecture

The repository is structured as a clean two-folder Bun workspace monorepo (`backend/` and `frontend/`) deployed as a **single unified server process**:

```text
cafe-stock/
├── backend/                        # ElysiaJS Backend + Drizzle ORM (PostgreSQL)
│   ├── drizzle/                    # Generated SQL migrations
│   ├── src/
│   │   ├── app.ts                  # Core Elysia instance (/api/* + SSR delegation)
│   │   ├── db/
│   │   │   ├── schema.ts           # PostgreSQL snake_case tables -> camelCase models
│   │   │   ├── migrate.ts          # Programmatic & CLI SQL migration runner
│   │   │   └── seed.ts             # Idempotent master data & RBAC seeder
│   │   ├── modules/                # Vertical-Slice Domain Modules
│   │   │   ├── auth/               # Session authentication & RBAC (USER / APPROVER)
│   │   │   ├── products/           # Product master data
│   │   │   ├── suppliers/          # Supplier master data
│   │   │   ├── warehouses/         # Warehouse master data
│   │   │   ├── purchase-requests/  # PR lifecycle (DRAFT -> SUBMITTED -> APPROVED/REJECTED)
│   │   │   ├── purchase-orders/    # PO lifecycle (DRAFT -> ORDERED -> PARTIALLY_RECEIVED -> RECEIVED)
│   │   │   ├── goods-receipts/     # Atomic Goods Receipt transaction + stock upsert
│   │   │   ├── inventory/          # Balances & append-only movement ledger
│   │   │   └── audit-logs/         # Traceable system audit trail
│   │   └── utils/                  # Logger, AppError, Pagination, Idempotency, SSR Bridge
│   └── index.ts                    # Thin entrypoint calling app.listen()
├── frontend/                       # SvelteKit 5 Server-Side Rendered (SSR) Web App
│   ├── src/
│   │   ├── hooks.server.ts         # Server session & i18n (ID / EN / JP) resolution
│   │   ├── lib/
│   │   │   ├── i18n.ts             # Multi-language dictionary (Indonesian, English, Japanese)
│   │   │   ├── types.ts            # Shared domain interfaces
│   │   │   └── server/api.ts       # SSR backend client (in-memory bridge + HTTP fallback)
│   │   └── routes/                 # SSR Pages (+page.server.ts & +page.svelte)
│   └── vite.config.ts              # SvelteKit + @sveltejs/adapter-node configuration
├── Dockerfile                      # Production container (builds SSR & runs Elysia server)
├── docker-compose.yml              # Orchestrates PostgreSQL 16 + CafeStock App via .env
└── .env.example                    # Environment variable template (zero hardcoded secrets)
```

### How Backend & Frontend SSR Combine on a Single Port

1. **`frontend/`** is compiled using `@sveltejs/adapter-node` into `frontend/build/` (`frontend/build/client` for static assets and `frontend/build/server/server.js` for the Web-standard `Request -> Response` SSR engine).
2. **`backend/`** starts ElysiaJS on port `3000`:
   - Requests matching `/api/*` are handled directly by Elysia's vertical-slice domain controllers.
   - Requests matching static client assets (`/_app/immutable/*`) are served from `frontend/build/client` with immutable cache headers.
   - All page routes (`/`, `/login`, `/master`, `/purchase-requests`, `/purchase-orders`, `/goods-receipts`, `/inventory`, `/audit-logs`) are delegated to the SvelteKit SSR server handler, which calls Elysia's API routes in-memory with zero network latency.

---

## 2. Tech Stack

| Layer                  | Technology                                                                                               |
| :--------------------- | :------------------------------------------------------------------------------------------------------- |
| **Runtime**            | Bun `1.x`                                                                                                |
| **Backend Framework**  | ElysiaJS `1.4` (Vertical-Slice Architecture)                                                             |
| **Frontend Framework** | SvelteKit `3.x` + Svelte `5` Runes (Server-Side Rendering via `@sveltejs/adapter-node`)                  |
| **Styling**            | Tailwind CSS `4.x`                                                                                       |
| **Database & ORM**     | PostgreSQL `16` + Drizzle ORM `0.44` (`postgres` driver + `@electric-sql/pglite` isolated test fallback) |
| **Containerization**   | Docker & Docker Compose                                                                                  |

---

## 3. Environment Variables (`.env`)

No credentials are hardcoded in `docker-compose.yml` or application code. Copy `.env.example` to `.env` before running:

```bash
cp .env.example .env
```

| Variable                 | Description                                             | Example                                                                          |
| :----------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------- |
| `HOST`                   | Bind address for the Elysia HTTP server                 | `0.0.0.0`                                                                        |
| `PORT`                   | HTTP port for both `/api/*` and SvelteKit SSR           | `3000`                                                                           |
| `POSTGRES_USER`          | PostgreSQL username for Docker Compose                  | `cafestock_user`                                                                 |
| `POSTGRES_PASSWORD`      | PostgreSQL password for Docker Compose                  | `change_me_in_local_env`                                                         |
| `POSTGRES_DB`            | PostgreSQL database name                                | `cafestock_db`                                                                   |
| `POSTGRES_PORT`          | Host port mapped to PostgreSQL `5432`                   | `5432`                                                                           |
| `DATABASE_URL`           | PostgreSQL connection string used by Drizzle ORM        | `postgresql://cafestock_user:change_me_in_local_env@localhost:5432/cafestock_db` |
| `AUTO_MIGRATE`           | Automatically run migrations & seeder on server startup | `true`                                                                           |
| `SEED_USER_EMAIL`        | Default `USER` account email created by seeder          | `staff@cafestock.com`                                                            |
| `SEED_USER_PASSWORD`     | Default `USER` account password                         | `User123!`                                                                       |
| `SEED_APPROVER_EMAIL`    | Default `APPROVER` account email created by seeder      | `approver@cafestock.com`                                                         |
| `SEED_APPROVER_PASSWORD` | Default `APPROVER` account password                     | `Approver123!`                                                                   |

---

## 4. Running with Docker Compose (Recommended for Reviewers)

Spin up both **PostgreSQL 16** and the **CafeStock SSR + API Server** with a single command:

```bash
cp .env.example .env
docker compose up --build -d
```

- **Web UI (SvelteKit SSR) & API**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/api/health`
- On startup, the container automatically runs Drizzle SQL migrations and seeds the initial `USER`, `APPROVER`, warehouses, suppliers, and products.

---

## 5. Local Development Setup, Migrations & Seeder

### Install Dependencies

```bash
bun install
```

### Run Database Migrations & Seeder

```bash
# Generate SQL migrations from backend/src/db/schema.ts
bun --cwd=backend run db:generate

# Apply SQL migrations
bun --cwd=backend run db:migrate

# Seed initial master data and RBAC users
bun --cwd=backend run db:seed
```

### Seeded Default Accounts (Crucial for Reviewers)

| Role           | Email                    | Password       | Capabilities                                                                                                  |
| :------------- | :----------------------- | :------------- | :------------------------------------------------------------------------------------------------------------ |
| **`USER`**     | `staff@cafestock.com`    | `User123!`     | Manage Master Data, create & submit PRs, create & order POs, post Goods Receipts                              |
| **`APPROVER`** | `approver@cafestock.com` | `Approver123!` | All `USER` capabilities **plus** approving (`APPROVED`) or rejecting (`REJECTED`) submitted Purchase Requests |

_(The `/login` page also includes 1-click quick-fill buttons for both seeded accounts.)_

### Build & Start Single-Port Server Locally

```bash
# Build SvelteKit SSR bundle into frontend/build
bun run build

# Start ElysiaJS server (serves API + SvelteKit SSR on http://localhost:3000)
bun run start
```

---

## 6. Testing & Quality Assurance

Run the full automated test suite and static type checkers across both workspaces:

```bash
# Typecheck backend (tsc) and frontend (svelte-check)
bun run check

# Run unit & integration tests (14 procurement scenarios, atomic rollback, RBAC, idempotency)
bun run test
```

---

## 7. API Endpoints Overview (No Versioning, No Swagger)

All API endpoints return consistent JSON envelopes (`{ data: ... }` or `{ data: [...], meta: { page, limit, total, totalPages } }`) and structured error responses (`{ error: { code, message } }`):

- **Health**: `GET /api/health`
- **Auth**: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Master Data**:
  - `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PATCH /api/products/:id`
  - `GET /api/suppliers`, `GET /api/suppliers/:id`, `POST /api/suppliers`, `PATCH /api/suppliers/:id`
  - `GET /api/warehouses`, `GET /api/warehouses/:id`, `POST /api/warehouses`, `PATCH /api/warehouses/:id`
- **Purchase Requests**:
  - `GET /api/purchase-requests`, `GET /api/purchase-requests/:id`, `POST /api/purchase-requests`, `PATCH /api/purchase-requests/:id`
  - `POST /api/purchase-requests/:id/submit`
  - `POST /api/purchase-requests/:id/approve` _(Requires `APPROVER` role)_
  - `POST /api/purchase-requests/:id/reject` _(Requires `APPROVER` role)_
- **Purchase Orders**:
  - `GET /api/purchase-orders`, `GET /api/purchase-orders/:id`, `POST /api/purchase-orders`, `PATCH /api/purchase-orders/:id`
  - `POST /api/purchase-orders/:id/order`, `POST /api/purchase-orders/:id/cancel`
- **Goods Receipts (Atomic Transaction)**:
  - `GET /api/goods-receipts`, `GET /api/goods-receipts/:id`, `POST /api/goods-receipts` _(Supports `Idempotency-Key` header)_
- **Inventory & Audit Trail**:
  - `GET /api/inventory`, `GET /api/inventory/movements`, `GET /api/audit-logs`

---

## 8. Engineering Decisions & Assumptions

1. **Unified Single-Port Deployment (`backend/` + `frontend/build`)**:
   - Instead of requiring two separate servers or reverse proxies in production, ElysiaJS mounts `/api/*` first and delegates non-API routes directly to the compiled SvelteKit `Server` instance (`frontend/build/server/server.js`).
2. **Standard SvelteKit SSR Over Custom Micro-Kernel**:
   - All client-side micro-kernel abstractions were removed in favor of standard SvelteKit `+page.server.ts` load functions and progressive HTML form actions.
3. **Strict Atomic Goods Receipt Transaction**:
   - Posting a Goods Receipt executes inside a single `db.transaction(...)` block: validating PO status (`ORDERED` or `PARTIALLY_RECEIVED`), preventing over-receiving (`received_quantity + quantity_received <= ordered_quantity`), inserting receipt lines, upserting `inventory_balances`, appending `inventory_movements` (`PURCHASE_RECEIPT`), recomputing PO status (`PARTIALLY_RECEIVED` vs `RECEIVED`), and writing an `audit_logs` entry. Any validation failure rolls back the entire transaction.
4. **Idempotency Keys**:
   - Transactional POST endpoints (`submit`, `approve`, `reject`, `purchase-orders`, `goods-receipts`) accept an `Idempotency-Key` header persisted in `idempotency_keys` to prevent duplicate stock increments on network retries.
