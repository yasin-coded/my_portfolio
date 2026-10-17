# DevFolio — Full-Stack Developer Portfolio

A full-featured developer portfolio and blog platform built with **Django REST Framework** on the backend and **React + Vite** on the frontend. Features a public-facing portfolio site with a terminal-inspired "Violet Kernel" design, and a private owner dashboard for content management.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Public Site](#public-site)
  - [Owner Dashboard](#owner-dashboard)
  - [Backend API](#backend-api)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Both Servers Concurrently (MANDATORY)](#-running-both-servers-concurrently-mandatory)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Instructor Access](#instructor-access)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Design System](#design-system)

---

## Project Structure

```
my_portfolio/
+-- backend/                  # Django REST Framework API
¦   +-- accounts/             # Authentication (JWT login, logout, refresh, change-password)
¦   +-- blog/                 # Posts, categories, tags, comments, likes
¦   +-- contact/              # Visitor contact form submissions
¦   +-- core/                 # Settings, middleware, base models, throttles
¦   +-- dashboard/            # Owner stats endpoint
¦   +-- portfolio/            # Projects, skills, skill groups, experience, education
¦   +-- user_profile/         # Singleton owner profile
¦   +-- manage.py
¦   +-- requirements.txt
¦   +-- .env.example
¦
+-- frontend/
    +-- portfolio/            # React + Vite SPA
        +-- src/
        ¦   +-- api/          # Axios instance with JWT auto-refresh
        ¦   +-- components/   # Reusable UI, dashboard, layout, home section components
        ¦   +-- hooks/        # React Query data hooks
        ¦   +-- pages/        # Public pages + dashboard pages
        ¦   +-- routes/       # React Router config with protected route guard
        ¦   +-- styles/       # CSS design tokens and global styles
        ¦   +-- utils/        # cn, formatDate, Zod validators, error parsers
        +-- package.json
```

---

## Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| Django | >= 6.1 | Web framework |
| djangorestframework | >= 3.18 | REST API |
| djangorestframework-simplejwt | >= 5.5 | JWT authentication |
| django-filter | >= 26 | Querystring filtering |
| django-cors-headers | >= 4.9 | CORS policy |
| Pillow | >= 12.3 | Image upload handling |
| psycopg | >= 3.3 | PostgreSQL adapter |
| python-decouple | >= 3.8 | .env config |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Dev server & bundler |
| React Router DOM | 7 | Client-side routing |
| TanStack React Query | 5 | Server-state & caching |
| Axios | 1.8 | HTTP client |
| Tailwind CSS | 4 | Utility CSS |
| React Hook Form | 7 | Form management |
| Zod | 3 | Schema validation |
| Lucide React | 0.477 | Icon library |
| React Icons | 5 | Additional icon sets |
| React Markdown | 10 | Markdown rendering |
| Sonner | 2 | Toast notifications |

**Database:** PostgreSQL (default) with SQLite fallback via `DB_ENGINE` env var.

---

## Features

### Public Site

The public site is a single-page application. All sections live on the home page with anchor navigation; blog posts and projects have individual deep-linkable detail pages.

#### Hero Section
- Animated terminal-style typing effect cycling through configurable role strings
- Owner headline, bio, and call-to-action buttons
- Availability badge ("open to work" / "not available") driven by the profile model
- Social links (GitHub, LinkedIn, X/Twitter, website)

#### About Section
- Owner bio, location, years of experience
- Resume download link (PDF served from media storage)
- Key stats and personal highlights

#### Skills Section
- Skills rendered in groups and sub-sections (e.g. Backend, Frontend, DevOps)
- Proficiency level per skill (1-100)
- Category badges: Frontend, Backend, Database, DevOps, Tools, Soft Skills

#### Experience & Education
- Work experience with company, role, employment type, location, dates, and description
- "Currently working here" indicator for ongoing roles
- Education entries with degree, institution, field of study, and dates

#### Featured Projects (Home)
- 3 featured projects displayed with cover image, category badge, tech-stack chips, summary, and links
- "See all projects" link to the full projects list

#### Projects Page
- Full paginated grid of all projects
- Filter by category (Web, Mobile, API, ML, Other)
- Each project card shows cover image, category, tech stack, live URL, and GitHub URL
- Individual project detail page (/projects/:slug) with full description and tech stack

#### Blog
- Paginated article list with search, category filter, tag filter, and sort order
- URL-based filters (?page=, ?search=, ?category=, ?tag=, ?ordering=) so pages can be shared and refreshed
- "All Articles (N)" chip always shows the total published count regardless of active filter
- Category chips show published-only post counts
- Blog detail page (/blog/:slug) with:
  - Full Markdown content rendered as HTML
  - Reading time, views count, likes count, published date
  - Like button (anonymous, per-device via UUID visitor token, toggleable, 30/min throttled)
  - Copy URL share button
  - Threaded comments (1 level of nesting)
  - Related posts sidebar

#### Comments (Public)
- Visitors can submit a comment with name, email (kept private), optional website, and content
- Comments go into a pending queue — not visible until the owner approves them
- Visitors can reply to any top-level comment or to an existing reply
- Replies to replies are automatically flattened to the root comment to maintain 1-level nesting
- Throttled at 100 comments/min per IP (configurable via THROTTLE_COMMENT_RATE)

#### Contact Form
- Name, email, subject, message fields
- Messages saved to the database and visible in the owner dashboard
- Throttled at 3 submissions/hour per IP to prevent spam

#### Authentication
- Owner login at /login (hidden from public navigation)
- JWT-based: access token (60 min lifetime), rotating refresh token (7-day lifetime)
- Automatic silent token refresh on 401 responses with in-flight request queue

---

### Owner Dashboard

Accessible at /dashboard — JWT-protected, owner-only. Uses the same "Violet Kernel" terminal design.

#### Overview (/dashboard)
- Live stats: total posts, published posts, draft posts, total projects, total comments, pending comments, total messages, unread messages, total likes
- Pending comments count with direct "Moderate Comments" shortcut button
- Recent comment stream list

#### Posts (/dashboard/posts)
- Paginated list of all blog posts with status badge (Published / Draft)
- Create, edit, and delete posts
- Status filter: All / Published / Draft
- Inline comment count per post

#### Post Editor (/dashboard/posts/new, /dashboard/posts/:slug/edit)
- Full markdown post editor
- Fields: title, excerpt, markdown content, cover image upload, category, tags (multi-select), status (Draft / Published), featured flag
- Live markdown preview

#### Projects (/dashboard/projects)
- Paginated list with category filter and search
- Create and edit projects via modal:
  - Title, summary (200-char max with live character counter)
  - Full description, cover image upload
  - Category, live URL, GitHub URL
  - Display order, featured flag
  - Multi-select tech stack from existing skills
- Delete with confirmation dialog

#### Skills (/dashboard/skills)
- Manage individual skills: name, category, proficiency (1-100), icon, display order, featured flag, optional skill section assignment
- Manage skill groups (containers like "Backend", "Frontend")
- Manage skill sections (sub-headings within a group)

#### Experience (/dashboard/experience)
- Manage work experience entries: company, role, employment type, location, start/end dates, "currently here" toggle, description, company URL, display order
- Manage education entries: institution, degree, field of study, start/end years, grade, description

#### Taxonomy (/dashboard/taxonomy)
- Manage blog categories: name, slug (auto-generated from name), description
- Manage blog tags: name, slug (auto-generated from name)

#### Comments (/dashboard/comments)
- View all pending and approved comments
- Filter tabs: Pending / Approved / All
- Approve or unapprove individual comments with a single click
- Delete comments with confirmation
- Each row shows: commenter name, email, website, the post it belongs to (with link), content, and timestamp
- Paginated (10 per page)

#### Messages (/dashboard/messages)
- View all contact form submissions
- Mark messages as read/unread
- Delete messages
- Filter: Unread / All
- Each card shows sender name, email, subject, full message body, and timestamp

#### Profile (/dashboard/profile)
- Edit all profile fields: full name, headline, bio, email, phone, location, social links (GitHub, LinkedIn, X, website), years of experience, availability for hire
- Avatar upload (image)
- Resume upload (PDF)
- Edit hero pitch line and typed roles (strings that cycle in the hero typing animation)
- Change password form (requires current password + new password)

---

### Backend API

All endpoints are prefixed with /api/. Public endpoints are read-only for anonymous visitors; write operations require Authorization: Bearer <token>.

#### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login/ | Obtain access + refresh tokens |
| POST | /api/auth/refresh/ | Rotate refresh token |
| POST | /api/auth/logout/ | Blacklist refresh token (logout) |
| POST | /api/auth/change-password/ | Change owner password (auth required) |

#### Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/profile/ | Retrieve singleton owner profile |
| PATCH | /api/profile/ | Update profile (auth required) |

#### Portfolio

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/projects/ | List projects (filter: category, search, featured, page) |
| GET | /api/projects/:slug/ | Project detail |
| POST | /api/projects/ | Create project (auth required) |
| PATCH | /api/projects/:slug/ | Update project (auth required) |
| DELETE | /api/projects/:slug/ | Delete project (auth required) |
| GET | /api/skills/ | List all skills |
| POST/PATCH/DELETE | /api/skills/:id/ | Skill CRUD (auth required) |
| GET | /api/skill-groups/ | Skill groups with nested sections and skills |
| POST/PATCH/DELETE | /api/skill-groups/:id/ | Skill group CRUD (auth required) |
| GET | /api/experiences/ | Work experience list |
| POST/PATCH/DELETE | /api/experiences/:id/ | Experience CRUD (auth required) |
| GET | /api/education/ | Education list |
| POST/PATCH/DELETE | /api/education/:id/ | Education CRUD (auth required) |

#### Blog

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/posts/ | List published posts (search, category, tag, ordering, page) |
| GET | /api/posts/:slug/ | Post detail (auto-increments view count) |
| POST | /api/posts/ | Create post (auth required) |
| PATCH | /api/posts/:slug/ | Update post (auth required) |
| DELETE | /api/posts/:slug/ | Delete post (auth required) |
| POST | /api/posts/:slug/like/ | Toggle like (anonymous, per visitor UUID, 30/min) |
| GET | /api/posts/:slug/comments/ | List approved top-level comments with nested replies |
| POST | /api/posts/:slug/comments/ | Submit comment (throttled, pending queue) |
| GET | /api/categories/ | List categories with published post counts |
| POST/PATCH/DELETE | /api/categories/:id/ | Category CRUD (auth required) |
| GET | /api/tags/ | List tags with published post counts |
| POST/PATCH/DELETE | /api/tags/:id/ | Tag CRUD (auth required) |
| GET | /api/comments/ | Owner: list all comments (filter: is_approved) |
| PATCH | /api/comments/:id/ | Owner: approve/unapprove comment |
| DELETE | /api/comments/:id/ | Owner: delete comment |

#### Contact

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/contact/ | Submit contact message (throttled: 3/hour) |
| GET | /api/contact/ | Owner: list all messages (auth required) |
| PATCH | /api/contact/:id/ | Owner: mark read/unread (auth required) |
| DELETE | /api/contact/:id/ | Owner: delete message (auth required) |

#### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/stats/ | Aggregated site stats (auth required) |

**Rate Limits:**
- Anonymous global: 120/min
- Comment submission: 100/min (configurable via THROTTLE_COMMENT_RATE)
- Contact form: 3/hour
- Post likes: 30/min

---

## Getting Started

### Prerequisites

- Python 3.14+
- Node.js 24+
- PostgreSQL or SQLite
- Python virtual environment (venv/)

---

### ⚠️ Running Both Servers Concurrently (MANDATORY)

For the DevFolio application to function properly, **both the Python Django backend server and the React Vite frontend development server must be running at the same time in two separate terminal windows**:

1. **Terminal 1 — Python Django Backend API Server**:
   - Runs on `http://127.0.0.1:8000/`
   - Serves all REST API endpoints (`/api/...`), handles authentication, queries the database, and serves uploaded `/media/` files.

2. **Terminal 2 — React Vite Frontend Client Server**:
   - Runs on `http://localhost:5173/`
   - Serves the Single Page Application UI and sends API requests to the Django backend.

> **Important:** If only one server is running, the application will not work properly. The frontend will fail to load profile information, projects, skills, or blog posts without the backend API active.

---

### Backend Setup

In your first terminal:

```powershell
# 1. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 2. Navigate to backend directory
cd backend

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Copy .env.example to .env if not already created
Copy-Item .env.example .env
# Edit .env with your DB credentials and SECRET_KEY

# 5. Run database migrations
python manage.py migrate

# 6. Start the Django development server
python manage.py runserver
```

- API Base: `http://127.0.0.1:8000/api/`
- Django Admin: `http://127.0.0.1:8000/admin/`

---

### Frontend Setup

In your second terminal:

```powershell
# 1. Navigate to frontend portfolio directory
cd frontend/portfolio

# 2. Install dependencies
npm install

# 3. Configure environment variable (if not already set)
# Ensure .env has: VITE_API_URL=http://127.0.0.1:8000/api

# 4. Start the Vite development server
npm run dev
```

- Frontend UI: `http://localhost:5173/`

---

### Instructor Access

> **For Instructor Only:**
> - **ID:** `admin`
> - **Password:** `admin123`
>
> *(Note: This account will be deleted after checking.)*

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| SECRET_KEY | django-insecure-... | Django secret key |
| DEBUG | True | Django debug mode |
| ALLOWED_HOSTS | localhost,127.0.0.1 | Comma-separated list of allowed hosts |
| CORS_ALLOWED_ORIGINS | http://localhost:5173,http://127.0.0.1:5173 | Comma-separated allowed CORS origins |
| DB_ENGINE | django.db.backends.postgresql | Database backend (or sqlite3) |
| DB_NAME | devfolio | Database name |
| DB_USER | postgres | Database user |
| DB_PASSWORD | postgres | Database password |
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| THROTTLE_ANON_RATE | 120/min | Global anonymous API throttle rate |
| THROTTLE_COMMENT_RATE | 100/min | Comment submission throttle rate |

### Frontend (`frontend/portfolio/.env`)

| Variable | Default | Description |
|---|---|---|
| VITE_API_URL | http://127.0.0.1:8000/api | Backend API base URL |

---

## Architecture

```
Browser
  |
  +-- React SPA (Vite, React Router, TanStack Query)
  |     +-- Public Layout  --> Home, Blog Detail, Project Detail
  |     +-- Dashboard      --> Protected, owner-only CRUD pages
  |
  +-- Axios client (JWT auto-refresh, X-Visitor-Id header)
        |
        v
   Django REST Framework
        +-- accounts      --> JWT auth (obtain, refresh, blacklist)
        +-- user_profile  --> Singleton profile model
        +-- portfolio     --> Projects, Skills, Experience, Education
        +-- blog          --> Posts, Comments, Likes, Categories, Tags
        +-- contact       --> Contact form messages
        +-- dashboard     --> Aggregated stats
        +-- core          --> Shared models, throttles, middleware
              |
              v
        Database (PostgreSQL / SQLite)
        /media/ (Local media upload directory for avatars, covers, resumes)
```

**Key design decisions:**

- The API enforces `IsAuthenticatedOrReadOnly` globally — the public site is read-only for anonymous visitors
- Single owner user; permissions enforced via an `IsOwner` custom permission class (not Django groups/roles)
- Profile is a singleton model; `clean()` prevents creating a second instance
- Blog post and project slugs are auto-generated from titles with numeric suffix collision resolution (`my-post-2`)
- Reading time is calculated server-side on every post save at 200 wpm
- Draft posts are invisible to anonymous visitors; owner queries them with `?status=DRAFT` or `?status=all`
- Comments require owner approval before becoming public
- Replies to replies are flattened to the root comment on the backend to maintain strict 1-level nesting
- Post likes are anonymous, tracked per visitor UUID (`X-Visitor-Id` header stored in localStorage)
- `ResponseLoggingMiddleware` injects an `X-Response-Time` header into every response

---

## Design System

The frontend uses the **"Violet Kernel"** terminal theme:

- **Colours**: Dark background with violet/purple accent colour
- **Typography**: Monospace (`font-mono`) for headings, labels, and decorative text; sans-serif for body copy
- **Components**: Glassmorphism cards with subtle borders, skeleton loading states, animated modals
- **Tokens**: CSS custom properties defined in `src/styles/tokens.css`
- **Styling engine**: Tailwind CSS v4 utility classes composed with a `cn()` helper
- **Animations**: Smooth hover transitions and micro-animations; typing cursor animation in the hero
- **Visual motifs**: Terminal decorators (`//`, `$`, `>`) used as section-heading prefixes and form label decorators

---

*Built by Yasin — Ostad Batch, Module 21*
