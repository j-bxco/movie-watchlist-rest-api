# 🎬 Movie Watchlist REST API
This project is a backend REST API for managing movie watchlists, built with: 

| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| Testing | Vitest, Supertest |
| Deployment | Render |

## 🎯 Purpose
- Practice backend development while transitioning from frontend to fullstack.
- Rebuild a JavaScript tutorial project entirely in TypeScript.
- Apply production-oriented backend practices including **authentication, validation, error handling, rate limiting, and deployment**.

## ✨ Features
- JWT authentication with bcrypt password hashing
- CRUD operations for movies and watchlists
- Request validation with Zod
- Prisma ORM with PostgreSQL
- Centralized error handling
- Rate limiting for authentication and mutation endpoints
- Unit testing with Vitest
- Integration testing with Supertest
- Production deployment on Render with Neon PostgreSQL

## 🧪 Testing
Automated testing is implemented using:
- **Vitest** for unit testing of validators and middleware.
- **Supertest** for integration testing of authentication, movie, and watchlist API endpoints.

## 💻 Development & Context
This project began as a JavaScript tutorial, but the implementation was **rewritten entirely in TypeScript from scratch.**

The rewrite involved:
- Configuring a TypeScript backend from the ground up
- Defining strict types throughout the application
- Extending Express request types
- Integrating Prisma with TypeScript
- Applying type-safe validation and error handling

## ☁️ Deployment
- Deployed as a **single Render Web Service**
- PostgreSQL database hosted on **Neon**
- Production secrets are managed through **Render environment variables**
- Repository includes only an `.env.example` template (no secrets are committed)
- Automatic deployment is triggered on pushes to the `main` branch
- Deployment health is verified using Render deployment logs

# 🚀 Getting Started
## 📋 Prerequisites
- Node.js (v18+)
- PostgreSQL (local or hosted)
- npm or yarn package manager

## 🛠️ Installation & Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env file` using `.env.example`.
4. This project uses Prisma ORM. Run the following command to apply database migrations: `npx prisma migrate dev --name init`
5. Start the development server: `npm run dev`
