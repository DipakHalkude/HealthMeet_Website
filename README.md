# HealthMeet Website

A full-stack web application for healthcare appointment management, featuring separate portals for users, doctors, admins, and a backend API.

## Project Structure

```
HealthMeet_Website/
  ├── admin/      # Admin React app
  ├── backend/    # Node.js/Express backend API
  ├── frontend/   # User-facing React app
```

## Folders
- **frontend/**: Main user website (React + Vite)
- **admin/**: Admin dashboard (React + Vite)
- **backend/**: REST API (Node.js/Express, MongoDB)

## Deployment
- Deploy `frontend` and `admin` to Vercel (as separate projects, root = each folder)
- Deploy `backend` to Render/Railway/Cyclic (root = backend folder)
- Set environment variables (e.g., `VITE_BACKEND_URL` in frontend/admin, `MONGODB_URL` in backend)

## Local Development

1. **Frontend**
   ```sh
   cd frontend
   npm install
   npm run dev
   ```
2. **Admin**
   ```sh
   cd admin
   npm install
   npm run dev
   ```
3. **Backend**
   ```sh
   cd backend
   npm install
   node server.js
   ```

## Features
- User registration/login, doctor search, appointment booking
- Admin dashboard for managing doctors, appointments, and users
- Doctor dashboard for managing their appointments

---

For more details, see the README in each folder. 