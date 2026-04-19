# Hostel Management System

A web-based Hostel Management System built with Node.js, Express.js, MongoDB, and vanilla JavaScript.

## Features

### Student
- Register and log in
- Apply for hostel accommodation
- View room allocation and roommate details
- Submit maintenance/complaint requests
- Track complaint status (Pending/Resolved)

### Admin
- Manage hostels and rooms
- Approve or reject room requests
- Allocate rooms to students
- Manage maintenance complaints
- View dashboard statistics

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Auth: JWT

## Project Structure

```text
hackathon/
├── middleware/            # Express middleware
│   └── auth.js
├── models/                # Mongoose models
│   ├── Complaint.js
│   ├── Hostel.js
│   ├── Request.js
│   ├── Room.js
│   └── User.js
├── public/                # Static frontend assets
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── routes/                # API route handlers
│   ├── auth.js
│   ├── complaints.js
│   ├── hostels.js
│   ├── reports.js
│   ├── requests.js
│   └── rooms.js
├── .env.example           # Environment variable template
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js              # App entrypoint
```

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

Copy `.env.example` to `.env` and fill values:

```env
MONGODB_URI=mongodb://localhost:27017/hostel-management
JWT_SECRET=your-strong-secret
PORT=3000
```

### 3) Start MongoDB

Windows:

```powershell
net start MongoDB
```

### 4) Start app

```bash
npm start
```

Development mode:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Upload to GitHub (Systematic Checklist)

1. Confirm ignored files are not tracked (`node_modules`, `.env`).
2. Keep `package-lock.json` committed for reproducible installs.
3. Ensure `.env.example` exists and contains safe placeholders.
4. Initialize git if needed:

```bash
git init
git add .
git commit -m "Initial commit: hostel management system"
```

5. Create GitHub repo and push:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## Deployment Notes (Render)

- Build Command: `npm install`
- Start Command: `npm start`
- Required env vars: `MONGODB_URI`, `JWT_SECRET`
- Do not commit `.env`

