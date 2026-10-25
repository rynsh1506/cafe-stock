# CafeStock - Self-Hosted Inventory Procurement System

[![Bun](https://img.shields.io/badge/Runtime-Bun%201.4-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![React](https://img.shields.io/badge/Frontend-React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203%20WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%204-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 1. Project Overview

**CafeStock** is a self-hosted, single-process inventory procurement management system designed for cafes, roasteries, and warehouse logistics. Built with an atomic procurement workflow:

```text
Purchase Request (PR) ──> Approval / Rejection ──> Purchase Order (PO) ──> Goods Receipt (GR) ──> Inventory Stock Updated
```

Inspired by the standalone self-hosted philosophy of software like Gitea and osTicket, CafeStock runs as a **single unified server process**. When launched, it hosts both the JSON REST API and directly serves the compiled React application (`dist/index.html` and assets) on the root endpoint `/`. Zero complex orchestration or multi-service manual setup required.

---

## 2. Architecture & Design Principles

### Single-Process Unified Serving

- **Endpoint `/`**: Serves `dist/index.html` and static assets (`/assets/*`). Supports client-side SPA routing fallbacks for bookmarking and page refreshes.
- **Endpoint `/api/*`**: High-performance REST endpoints for health checks, snapshot retrieval, user accounts, and transactional persistence.
- **Embedded Relational Storage**: Zero configuration required. Backed by `database/cafe_stock.sqlite` utilizing WAL (Write-Ahead Logging) mode and foreign key constraints for fast, atomic operations.
- **Multi-Device & LAN Ready**: Binds to `0.0.0.0`, enabling immediate access across the local network (Wi-Fi/LAN IP) or behind tunneling tools (Cloudflare Tunnel, ngrok) from laptops, tablets, or phones without requiring native client installations.

---

## 3. Tech Stack

- **Runtime & Engine**: [Bun](https://bun.sh/) (Native HTTP Server via `Bun.serve` + `bun:sqlite` engine)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tooling**: [Vite 8](https://vitejs.dev/)
- **Testing**: Bun Test runner (`bun:test`)

---

## 4. Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (`v1.2` or later recommended)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rynsh1506/cafe-stock.git
cd cafe-stock
bun install
```

---

## 5. Running the Application

### Production / Standalone Mode (Recommended)

Compile the React frontend to `dist/` and launch the self-hosted server:

```bash
# Build frontend
bun run build

# Start server on http://localhost:3000/
bun run start
```

Console output confirms access URLs:

```text
========================================================
  ☕ CAFE STOCK - Self-Hosted Inventory Server
========================================================
  Local Access:    http://localhost:3000/
  Network Access:  http://192.168.1.100:3000/
  Database File:   database/cafe_stock.sqlite
  Endpoint '/':    Serving built React frontend (dist/index.html)
  Endpoint '/api': Serving SQLite JSON REST API
========================================================
```

### Development Mode (with Instant HMR)

Run the Vite development server:

```bash
bun run dev
```

Open `http://localhost:5173/` in your browser. API requests to `/api/*` are automatically handled by the embedded SQLite middleware.

---

## 6. Environment Variables

All variables have sensible defaults for immediate local execution. Create a `.env` file if customization is required:

| Variable         | Default                      | Description                                               |
| ---------------- | ---------------------------- | --------------------------------------------------------- |
| `PORT`           | `3000`                       | HTTP listening port for standalone server                 |
| `HOST`           | `0.0.0.0`                    | Host binding interface (`0.0.0.0` for all LAN interfaces) |
| `SQLITE_DB_PATH` | `database/cafe_stock.sqlite` | Filepath of persistent SQLite database                    |

---

## 7. Default Seed Data & Accounts

The system automatically initializes relational tables in `database/cafe_stock.sqlite`. Built-in accounts include:

| Role         | Username | Display Name       | Permissions                                                                     |
| ------------ | -------- | ------------------ | ------------------------------------------------------------------------------- |
| **APPROVER** | `admin`  | Muhammad Riyansyah | Full access: Create PR, Approve/Reject PR, Generate PO, Receive GR, Master Data |
| **USER**     | `staff`  | Staff Gudang       | Standard access: Create PR, View Inventory & Catalogs                           |

---

## 8. API Specification

| Method | Endpoint               | Description                                                   |
| ------ | ---------------------- | ------------------------------------------------------------- |
| `GET`  | `/`                    | Serves React Single Page Application (`dist/index.html`)      |
| `GET`  | `/api/health`          | Health check & server uptime metrics                          |
| `GET`  | `/api/sqlite/snapshot` | Retrieves complete relational snapshot from database          |
| `POST` | `/api/sqlite/users`    | Persists user accounts and role authentication data           |
| `POST` | `/api/sqlite/save`     | Atomic transaction saving products, PRs, POs, GRs, & balances |
| `POST` | `/api/sqlite/wipe`     | Clears relational data (optionally preserves users)           |

---

## 9. Automated Testing

Run the test suite verifying database transactions and REST API endpoints:

```bash
bun test
```

---

## 10. Engineering Decisions & Assumptions

1. **Elimination of Tauri Desktop Wrapper**:
   - _Problem_: Tauri native commands (`invoke`) operate exclusively within a local webview desktop window. External devices accessing via browser over LAN cannot call native desktop bindings, breaking multi-device cafe operations.
   - _Decision_: Removed `src-tauri/` and Tauri client dependencies. Transitioned to a self-hosted single-server architecture where Bun serves static assets on `/` and API routes on `/api/*`.
   - _Result_: Users can access CafeStock from any web browser on any device (phone, tablet, POS, laptop) with zero client-side installation.

2. **Embedded Disk SQLite vs External Database**:
   - To eliminate reviewer friction and manual database provisioning, the application persists directly to `database/cafe_stock.sqlite` using SQLite WAL mode. Portable SQL dumps can be exported directly from the UI for PostgreSQL / MariaDB migration.
