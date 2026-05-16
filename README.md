# TaskFlow

> **TaskFlow** is a modern full‑stack task management web application built with **Express 5**, **Prisma**, **Vue 3**, **Pinia**, **Vite**, and **Tailwind v4**. It provides a clean UI (with SVG icons) and a robust API that supports authentication, role‑based access, and advanced task filtering.

---

## 🎯 Features

- **Authentication** (JWT httpOnly cookies, refresh flow)
- **Role‑based access** – admin vs regular user
- **Task CRUD** with pagination, search, status & priority filters
- **Dashboard** with statistics and recent activity
- **Reusable UI components** – `AppIcon` (SVG icon system), `ConfirmModal`, `ToastContainer`
- **Responsive layout** with a collapsible sidebar
- **Backend validation** using **Zod** (handles empty query strings gracefully)
- **Production‑ready build** with Vite and optimized Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js (v20), Express 5, Prisma 7, PostgreSQL, Zod, JWT, dotenv |
| **Frontend** | Vue 3 (Composition API), Pinia, Vite, Tailwind v4, Axios |
| **Icons** | Custom `AppIcon.vue` component with 28 SVG icons |
| **Testing** | Manual UI testing + API response validation |

---

## 📋 Prerequisites

- **Node.js** >= 20
- **npm** (comes with Node) or **pnpm**/Yarn if you prefer
- **PostgreSQL** database (local or remote)
- **Git** (to clone the repo)

---

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/achmad-gg/TaskFlow.git
cd TaskFlow
```

### 2. Backend configuration
```bash
cd backend
cp .env.example   # copy the example file
```
Edit `.env` and set the following variables:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
JWT_SECRET=64‑character‑hex‑string
JWT_REFRESH_SECRET=64‑character‑hex‑string
PORT=3000
```
> **Tip:** The secrets must be exactly 64 hex characters (e.g., `a3f5...`).

#### Install dependencies & migrate DB
```bash
npm install
npx prisma migrate dev   # creates the tables
```
Start the backend (development):
```bash
npm run dev   # runs on http://localhost:3000
```

### 3. Frontend configuration
```bash
cd ../frontend
cp .env.example .env   # copy example env
```
Edit `.env` – the only required key is the API base path (the dev proxy handles CORS):
```env
VITE_API_BASE_URL=/api/v1   # use proxy during dev
```
#### Install dependencies & run dev server
```bash
npm install
npm run dev   # Vite dev server at http://localhost:5173
```
The frontend proxies `/api` to the backend, so both servers can run simultaneously.

---

## 📦 Production Build

1. **Backend** – build Docker image or run `npm start` after installing dependencies.
2. **Frontend** – generate a static bundle:
```bash
npm run build   # creates ./dist
```
Serve the static files with any web server (NGINX, Vercel, Netlify, etc.) and ensure the backend API is reachable at the configured base path.

---

## 🗺️ API Overview (Backend)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | Login, returns JWT cookies |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `GET`  | `/api/v1/tasks` | List tasks – supports `search`, `status`, `priority`, `sortBy`, `sortOrder`, `page`, `limit` |
| `POST` | `/api/v1/tasks` | Create a task |
| `PATCH`| `/api/v1/tasks/:id` | Update a task |
| `DELETE`| `/api/v1/tasks/:id` | Delete a task |
| `GET`  | `/api/v1/users/me` | Get current user info |
| `GET`  | `/api/v1/admin/users` | Admin: list users |
| `PATCH`| `/api/v1/admin/users/:id/toggle` | Admin: activate/deactivate user |
| `GET`  | `/api/v1/dashboard/stats` | Dashboard statistics |

---

## 🤝 Contributing
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Make your changes and ensure the app still builds (`npm run dev`)
4. Open a Pull Request describing the changes

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 🎉 Thanks for checking out TaskFlow!
Feel free to open an issue if you run into bugs or have feature ideas.

## Screenshot
![Dashboard Preview](./assets/screenshots/dashboard.png)
