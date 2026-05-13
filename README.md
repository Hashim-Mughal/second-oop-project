# TaskManager — OOP Before-Refactoring Study

A full-stack **Task Manager** application built with **Node.js**, **Express**, and **MongoDB** as a final semester project of OOP course.


## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Runtime   | Node.js                             |
| Framework | Express 5                           |
| Database  | MongoDB via Mongoose                |
| Auth      | JWT (`jsonwebtoken`) + `bcryptjs`   |
| Frontend  | Vanilla HTML/CSS/JS (single file)   |
| Dev Tools | `nodemon`, `dotenv`                 |

---

## Project Structure

```
second-oop-project/
├── backend/
│   ├── server.js                  # Entry point (no composition root)
│   └── src/
│       ├── middleware/
│       │   └── auth.js            # JWT guard (hardcoded strategy)
│       ├── models/
│       │   ├── User.js
│       │   ├── Task.js
│       │   └── Comment.js
│       └── routes/
│           ├── userRoutes.js
│           ├── taskRoutes.js
│           └── commentRoutes.js
└── taskmanager-frontend.html      # Single-file frontend UI
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

### Installation

```bash
git clone https://github.com/Hashim-Mughal/second-oop-project.git
cd second-oop-project/backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
```

### Running the Server

```bash
npm start
npm run dev
```

The API will be available at `http://localhost:5000`.

Open `taskmanager-frontend.html` directly in a browser to use the UI.

---

## API Overview

| Method | Endpoint                          | Description              | Auth |
|--------|-----------------------------------|--------------------------|------|
| POST   | `/api/users/register`             | Register a new user      | ✗    |
| POST   | `/api/users/login`                | Login and receive JWT    | ✗    |
| GET    | `/api/tasks`                      | List all tasks (filtered)| ✓    |
| POST   | `/api/tasks`                      | Create a task            | ✓    |
| PUT    | `/api/tasks/:id`                  | Update a task            | ✓    |
| DELETE | `/api/tasks/:id`                  | Delete a task            | ✓    |
| GET    | `/api/tasks/:taskId/comments`     | List comments on a task  | ✓    |
| POST   | `/api/tasks/:taskId/comments`     | Add a comment            | ✓    |

Protected routes require the header: `Authorization: Bearer <token>`

---

## Environment Variables

| Variable     | Default                                   | Description              |
|--------------|-------------------------------------------|--------------------------|
| `PORT`       | `5000`                                    | HTTP port                |
| `MONGO_URI`  | `mongodb://localhost:27017/taskmanager`   | MongoDB connection string|
| `JWT_SECRET` | `secret123`                               | JWT signing secret       |

