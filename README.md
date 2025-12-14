# TextTile-POS

A lightweight, modular Point-of-Sale (POS) system built with a TypeScript frontend and a Go backend. TextTile-POS focuses on a compact, keyboard-first interface for fast data entry and checkout workflows, intended for small retailers, kiosks, and learning projects.

Primary languages:
- TypeScript (frontend, UI and client logic) — ~56.7%
- Go (backend API, services) — ~38%
- Minor scripts and assets: PowerShell, Batchfile, CSS, JavaScript, HTML

This README explains how the repository is organized, how to build and run the system locally, and how to contribute.

Table of contents
- About
- Features
- Tech stack
- Repository layout
- Requirements
- Quick start
  - Backend (Go)
  - Frontend (TypeScript)
  - Using Docker (optional)
- Configuration
- Testing
- Development notes
- Contributing
- License
- Contact

About
-----
TextTile-POS is intended to be:
- Fast to use (keyboard-first flows and minimal mouse interactions)
- Modular (separate frontend and backend to allow swapping components)
- Lightweight (suitable for low-resource devices)
- Educational — good example of a TypeScript + Go full-stack project

Features
--------
- Product lookup and barcode entry
- Quick sale / checkout workflow
- Inventory adjustments
- Transaction history (basic)
- Configurable tax and pricing rules
- Extensible API for adding payment integrations or reporting

Tech stack
----------
- Frontend: TypeScript (React / Preact / other TS-based UI — see package.json)
- Backend: Go (REST/JSON API)
- Build & tooling: Node.js / npm (or yarn) for frontend; go toolchain for backend
- Optional: Docker / Docker Compose for local environment

Repository layout
----------------
- /cmd, /internal, /pkg or similar — Go backend source (API, services)
- /web, /frontend, /ui — TypeScript frontend application
- /scripts — helper scripts (PowerShell, Batchfile)
- /assets — CSS, images, static HTML if present
- README.md — this file

(Actual folder names may vary — check the repository root to confirm.)

Requirements
------------
- Node.js 16+ (or the version listed in frontend package.json)
- npm or yarn
- Go 1.18+ (or the version the backend requires)
- Optional: Docker & Docker Compose (for containerized local setup)

Quick start
-----------

1) Backend (Go)
- From the repository root, change into the backend directory (example: ./backend or ./api):
  ```
  cd backend
  ```
- Build:
  ```
  go build -o texttile-pos
  ```
- Run:
  ```
  ./texttile-pos
  ```
  By default the API will listen on the port defined in config or environment variables (see Configuration below).

- Or run directly (dev):
  ```
  go run ./cmd/server
  ```

2) Frontend (TypeScript)
- From the repository root, change into the frontend directory (example: ./web or ./frontend):
  ```
  cd frontend
  ```
- Install dependencies:
  ```
  npm install
  # or
  yarn install
  ```
- Start development server:
  ```
  npm run dev
  # or
  yarn dev
  ```
  The dev server typically runs on http://localhost:3000 (or as configured). Configure the frontend to point to the backend API host/port (see Configuration).

- Build production bundle:
  ```
  npm run build
  # serve or deploy the static files produced in the dist/ or build/ directory
  ```

3) Using Docker (optional)
- If repository contains a docker-compose.yml you can start both services:
  ```
  docker-compose up --build
  ```
- Or build individual images:
  ```
  docker build -t texttile-pos-backend ./backend
  docker build -t texttile-pos-frontend ./frontend
  ```

Configuration
-------------
The project supports configuration via environment variables or configuration files. Typical variables:

Backend
- PORT — API port (default: 8080)
- DATABASE_URL — connection string if using a DB
- LOG_LEVEL — debug/info/warn/error

Frontend
- VITE_API_URL or REACT_APP_API_URL (depending on tooling) — base URL for the backend API
- NODE_ENV — development / production

Look for a sample env file (example: .env.example) in the repo root or in each subproject folder. If none exists, create one based on your environment.

Testing
-------
Frontend (TypeScript)
- Run unit tests:
  ```
  npm test
  # or
  yarn test
  ```

Backend (Go)
- Run Go tests:
  ```
  cd backend
  go test ./...
  ```

Development notes
-----------------
- Use feature branches (feature/*) for new features and fix/* for bugfixes.
- Keep frontend components focused and small. Add unit tests for business logic.
- Keep Go packages well-scoped; prefer small, testable packages.
- If adding a database schema, include migrations and sample seed data.

Contributing
------------
Contributions are welcome! Suggested workflow:
1. Fork the repository.
2. Create a branch: git checkout -b feature/your-feature
3. Add your changes, tests, and documentation.
4. Commit and push your branch.
5. Open a Pull Request describing the change and the motivation.

When contributing:
- Keep changes small and focused.
- Add or update README or example usage for new features.
- Add tests for critical logic.

License
-------
This repository does not include a license file by default. If you intend to reuse or distribute code, please ensure the repository includes a LICENSE file (common choices: MIT, Apache-2.0).

Contact
-------
Repository: https://github.com/lathiyaom/TextTile-POS
Owner / Maintainer: lathiyaom

If you find bugs or want improvements, please open an issue or submit a pull request.

Acknowledgements
----------------
Thank you for checking out TextTile-POS — a compact, practical example of a TypeScript frontend combined with a Go backend for POS workflows.

Happy hacking!
