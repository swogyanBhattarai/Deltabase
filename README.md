# Deltabase

Deltabase is a collaborative file management platform. It lets you organize project files with your team, track changes over time, and manage who has access to what.

## What you can do

### Account management
- Register a new account and log in securely
- View and update your user profile 
- Search users and projects

### Projects
- Create new projects
- View all projects you're a member of
- Add or remove team members from a project and assign them roles

### Files
- Upload files to any project you belong to
- Browse and download files within a project
- Delete files you no longer need
- Inspect what changed between file versions using the built-in diff viewer

## Getting started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (to run the backend)
- [Node.js LTS](https://nodejs.org/) and npm (to run the frontend)

### 1. Start the backend

From the repository root:
```bash
docker compose up -d
```

### 2. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> Make sure `frontend/.env` contains:
> ```
> NEXT_PUBLIC_API_URL=http://localhost:8080/api
> ```
> A `frontend/.env.example` file with this default is already included.

## First steps

1. Go to [http://localhost:3000](http://localhost:3000) — you'll be taken to the login page
2. Register a new account or log in
3. From your profile page, create a project or open an existing one
4. Upload files, invite teammates, and use the diff viewer to track changes