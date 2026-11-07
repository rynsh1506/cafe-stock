# CafeStock - Self-Hosted Inventory Procurement System

[![Bun](https://img.shields.io/badge/Runtime-Bun%201.4-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![ElysiaJS](https://img.shields.io/badge/Backend-ElysiaJS-black?style=for-the-badge&logo=elysia&logoColor=white)](https://elysiajs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Docs-Swagger%20OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%204-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 1. Project Overview

**CafeStock** is a self-hosted inventory procurement management system designed for cafes, roasteries, and warehouse logistics. Built with an atomic procurement workflow:

```text
Purchase Request (PR) ──> Approval / Rejection ──> Purchase Order (PO) ──> Goods Receipt (GR) ──> Inventory Stock Updated
```

Running as a **unified ElysiaJS backend application**, CafeStock both hosts high-performance REST APIs and directly serves the compiled React Single Page Application (`dist/index.html` and assets) on the root endpoint `/`.

---

## 2. Architecture & Design Principles

- **Unified Elysia Backend**: The application process is powered by [ElysiaJS](https://elysiajs.com/) (`src/app.ts`), serving:
  - **Endpoint `/` & `/login`**: Compiled React SPA static files from `dist/` with client-side SPA routing fallback.
  - **Endpoint `/swagger`**: Interactive OpenAPI / Swagger API documentation.
  - **Endpoint `/api/*`**: Type-safe REST APIs for procurement, inventory, users, and audit trail logs.
- **Dockerized Infrastructure**: Complete containerization via [Dockerfile](file:///home/xamnes/Projects/tauri/cafe-stock/Dockerfile) and [docker-compose.yml](file:///home/xamnes/Projects/tauri/cafe-stock/docker-compose.yml) orchestrating the Elysia application and a dedicated MySQL 8.0 database.
- **Strict Environment Security**: Zero hardcoded credentials. All database hosts, usernames, passwords, and ports are retrieved dynamically from environment variables (`.env`). The `.env` file is strictly ignored by Git, and a documented `.env.example` template is provided.
- **Dual Engine Compatibility**: Supports MySQL 8.0 via `mysql2/promise` with connection pooling and transactions, while providing zero-config SQLite fallback for offline development.

---

## 3. Tech Stack

- **Runtime & Framework**: [Bun](https://bun.sh/) & [ElysiaJS](https://elysiajs.com/)
- **Database**: [MySQL 8.0](https://www.mysql.com/) (Production & Docker) / SQLite 3 (Standalone)
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **API Documentation**: Elysia Swagger plugin ([Swagger UI](http://localhost:3000/swagger))
- **Testing**: Bun Test runner (`bun:test`)

---

## 4. Running with Docker (Recommended)

Spin up both the MySQL 8.0 database and the CafeStock application container with a single command:

```bash
# 1. Copy the environment variables template
cp .env.example .env

# 2. Build and run containers in detached mode
docker compose up -d --build
```

Access the system once running:

- **Application Web UI**: [http://localhost:3000/](http://localhost:3000/)
- **Swagger Documentation**: [http://localhost:3000/swagger](http://localhost:3000/swagger)
- **MySQL Database**: `localhost:3306`

To view container logs or stop services:

```bash
docker compose logs -f
docker compose down
```

---

## 5. Running Locally (Without Docker)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rynsh1506/cafe-stock.git
cd cafe-stock
bun install
```

### Production / Standalone Server

```bash
# 1. Build the React frontend into dist/
bun run build

# 2. Start the unified Elysia backend server
bun run start
```

### Development Mode (with Live Reload)

```bash
bun run dev
```

---

## 6. Environment Variables Reference

Configure environment variables in `.env` (refer to [.env.example](file:///home/xamnes/Projects/tauri/cafe-stock/.env.example)):

| Variable           | Default                      | Description                                                 |
| ------------------ | ---------------------------- | ----------------------------------------------------------- |
| `PORT`             | `3000`                       | HTTP listening port for application                         |
| `HOST`             | `0.0.0.0`                    | Host interface binding (`0.0.0.0` for all LAN interfaces)   |
| `DB_TYPE`          | `mysql`                      | Active database engine (`mysql` or `sqlite`)                |
| `DB_HOST`          | `mysql`                      | MySQL hostname (use `mysql` in Docker, `localhost` locally) |
| `DB_PORT`          | `3306`                       | MySQL port                                                  |
| `DB_NAME`          | `cafe_stock`                 | Database schema name                                        |
| `DB_USER`          | `cafe_user`                  | MySQL database username                                     |
| `DB_PASSWORD`      | -                            | MySQL database user password                                |
| `DB_ROOT_PASSWORD` | -                            | MySQL root user password (used by docker-compose)           |
| `DB_EXTERNAL_PORT` | `3306`                       | Port exposed by MySQL container on the host machine         |
| `SQLITE_DB_PATH`   | `database/cafe_stock.sqlite` | SQLite database filepath (when `DB_TYPE=sqlite`)            |

---

## 7. API Specification (Swagger)

Elysia automatically generates interactive OpenAPI documentation accessible at `/swagger`.

| Method | Endpoint                   | Description                                        |
| ------ | -------------------------- | -------------------------------------------------- |
| `GET`  | `/`                        | Serves compiled React frontend (`dist/index.html`) |
| `GET`  | `/login`                   | Serves Login / Setup Page (`dist/index.html`)      |
| `GET`  | `/swagger`                 | Interactive Swagger API Documentation              |
| `GET`  | `/api/health`              | Health check & active database engine status       |
| `GET`  | `/api/products`            | Lists catalog products                             |
| `GET`  | `/api/warehouses`          | Lists active warehouses                            |
| `GET`  | `/api/suppliers`           | Lists registered suppliers                         |
| `GET`  | `/api/purchase-requests`   | Lists purchase requests                            |
| `GET`  | `/api/purchase-orders`     | Lists purchase orders                              |
| `GET`  | `/api/goods-receipts`      | Lists received goods receipts                      |
| `GET`  | `/api/inventory/balances`  | Warehouse inventory stock balances                 |
| `GET`  | `/api/inventory/movements` | Stock movement audit trail                         |
| `GET`  | `/api/audit-logs`          | Transactional audit log history                    |
| `GET`  | `/api/sqlite/snapshot`     | Full relational database snapshot                  |
| `POST` | `/api/sqlite/users`        | Syncs user authentication accounts                 |
| `POST` | `/api/sqlite/save`         | Atomic transaction saving all procurement entities |
| `POST` | `/api/sqlite/wipe`         | Wipes relational data tables                       |

---

## 8. Automated Testing

Run the automated test suite covering database transactions, dynamic configuration, and Elysia API endpoints:

```bash
bun test
```
