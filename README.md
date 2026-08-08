# NoteLock

**NoteLock** is a centralised academic note-sharing platform for NUS students, replacing scattered Telegram chats with a structured, searchable platform where notes and cheatsheets are organised by module and preserved across semesters.

**Live site:** [notelock.vercel.app](https://notelock.vercel.app)

**Built by:** Aidan Tay & Oh Qi Xiang

<p align="center">
  <img width="496" height="702" alt="notelock poster A4" src="https://github.com/user-attachments/assets/e70506f7-c7e3-43f6-9d24-1527e8fcd00a" />
</p>

---

## Table of Contents

- [Motivation](#motivation)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [User Guide](#user-guide)
- [Project Design](#project-design)
- [API Routes](#api-routes)
- [Testing](#testing)

---

## Motivation

There is a lack of efficient and convenient ways to share study materials within NUS. Telegram group chats are private and hard to find, and online storage solutions like Google Drive or Studocu either require payment or are difficult to navigate. NoteLock solves this by giving students one place to upload, discover, and download module notes and cheatsheets freely.

---

## Features

### Core
| Feature | Description |
|---|---|
| Authentication | Secure registration and login restricted to verified NUS email addresses (`@u.nus.edu`) |
| Uploading | Upload PDF notes with a module, semester, and tags |
| Viewing & Downloading | Browse and download notes with a built-in PDF viewer |
| Module Pages | Dedicated pages per module with search, filter, and sort |
| Account Levels | Student, Professor, and Admin roles with different permissions |

<p align="center">
  <p><em>CS1101 Module Page</em></p>
  <img width="937" height="451" alt="image" src="https://github.com/user-attachments/assets/82fbe8c1-04ce-41f1-96a5-424818d42f14" />
</p>

### Extensions
| Feature | Description |
|---|---|
| Tagging | Tag notes as Midterm, Finals, Cheatsheet, PYP, etc. |
| Voting & Stats | Upvote/downvote notes and track download counts |
| Commenting | Leave general feedback or flag errors on notes |
| NUSMods Integration | Paste your NUSMods timetable link to favourite all your modules at once |
| AI Summary | Auto-generated 2–3 sentence summary of each uploaded note |
| Binders | Group notes together and download as a single merged PDF with page compression |
| Reporting | Flag notes for inappropriate content, wrong module, copyright, or spam |
| Admin Dashboard | Manage user roles and resolve flagged notes |

<p align="center">
  <p><em>Student Dashboard Page</em></p>
  <img width="913" height="366" alt="image" src="https://github.com/user-attachments/assets/e7732c33-ffd5-4eee-9cf0-088b58bcc8b9" />
</p>

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, TypeScript |
| Framework | Next.js 16 (App Router) |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Hosting | Vercel |
| Testing | Vitest, MSW, Playwright |
| CI/CD | GitHub Actions, Husky |
| Code Quality | ESLint, Prettier |

---

## User Guide

### Test Accounts

| Role | Email | Password |
|---|---|---|
| Student | theholygrail@u.nus.edu | Baugette12345 |
| Professor | professor@u.nus.edu | Baugette12345 |

### Student Walkthrough

1. Go to [notelock.vercel.app](https://notelock.vercel.app) and register with your NUS email, or use one of the sample accounts above
2. Check your NUS inbox and click the verification link
3. Click **Upload Notes** and fill in the upload form
4. Navigate to a module page (e.g. CS1101S) to browse sample notes
5. Filter by name, semester, or tags, sort by downloads, semester, or rating
6. Click **Favourite** to save the module to your dashboard
7. Go to **NUSMods Sync** and paste your timetable link to favourite all your modules at once
8. Create a **Binder** with the `+` button, drag notes into it, then download as a combined PDF

### Professor

- On any note page, use the dropdown menu to **feature** it (pinned to the top of results)
- Use the flag icon on the note page to report notes for removal

---

## Project Design

### Software Engineering Practices

**Version Control (Git, GitHub)**
We use branching, pull requests, milestones, and issues to maintain our codebase.
- `main`: production-ready code, connected to Vercel's production deployment
- `dev`: integration branch, connected to Vercel's preview deployments
- `feature/*`: individual feature branches, merged into `dev` via reviewed pull requests

**Code Quality (ESLint, Prettier, Husky)**
ESLint catches errors and enforces coding standards. Prettier formats code automatically on save. Husky runs both as a pre-commit hook, commits are blocked if linting or formatting fails.

**CI/CD (GitHub Actions)**
On every push or pull request to `main` or `dev`, GitHub Actions:
1. Checks out the repository
2. Installs Node.js and dependencies
3. Runs Vitest unit tests
4. Starts a local Supabase instance
5. Runs Playwright end-to-end tests
6. Uploads the Playwright report (retained for 30 days)

### Database Schema

<p align="center">
  <img width="756" height="549" alt="Database Schema" src="https://github.com/user-attachments/assets/d3e7b2cc-8fb6-4037-8658-db9cf5d5a968" />
</p>

The schema is in third normal form (3NF), eliminating redundant data and preventing update anomalies. Relationships such as note tagging, module favouriting, and binder contents are handled through dedicated junction tables.

### User Flow

<p align="center">
  <img width="661" height="465" alt="User Flow" src="https://github.com/user-attachments/assets/1ffc3ad0-8178-467b-ba86-a54d868b43fb" />
</p>

NoteLock's user flow begins at the landing page, where users without a session can register, log in, or reset their password, while those with an existing session are directed straight to the dashboard. From the dashboard, authenticated users can access core features including module search, favourited modules, their user profile, note uploads, NUSMods sync, and their binders. The module page serves as the central hub for note interaction, allowing users to browse and filter notes, then download, like, dislike, comment, flag, or get an AI summary of individual notes, as well as drag notes into binders for combined PDF downloads. Admin users have access to a separate admin dashboard where they can manage user roles and review flagged notes.

---

## API Routes

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new NUS account |
| POST | `/auth/login` | Public | Log in and create a session |
| POST | `/auth/resendVerification` | Public | Resend the verification email |
| GET | `/auth/confirmAccount` | Public | Handle Supabase email verification callback |
| POST | `/api/auth/logout` | Protected | Invalidate the current session |
| GET | `/api/modules` | Protected | Search modules by code or name |
| GET | `/api/notes/fetchNotesList` | Protected | Fetch paginated, filtered, and sorted notes |
| POST | `/api/notes/upload` | Protected | Upload a PDF note |
| POST | `/api/notes/download` | Protected | Increment the download counter for a note |
| POST | `/api/notes/delete` | Protected | Delete a note and its storage files |

---

## Testing

### Unit & Integration Tests (Vitest + MSW)

Tests cover component rendering, client-side validation, API interaction via mocked responses, and drag-and-drop behaviour across:

- Register Form, Login Form, Forgot Password Form
- Pending Verification component
- Upload Form (including Module Input and Semester Input)
- Note Panel (rendering, dropdown, dragging)
- Binder Preview (creation, title editing, drag and drop)
- Binder Page (reordering, download, delete)
- NUSMods Sync (extraction, favouriting, localStorage persistence)
- Dashboard Overview / Contributor Report Card
- Proxy (protected and public route access)
- API routes (`/auth/register`, `/auth/login`, `/modules`, `/notes/upload`, etc.)

### End-to-End Tests (Playwright)

Playwright tests run against a local Supabase instance and simulate complete user flows including registration, note upload, module search and filtering, binder creation and download, and admin actions.
