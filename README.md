# 🎬 Movie Watchlist REST API

This project is a learning-focused backend implementation of a Movie Watchlist API using **Node.js**, **Express**, and **TypeScript**.

## 🎯 Purpose

- Practice backend development as a frontend developer moving toward fullstack work.
- Rebuild a tutorial-based Javascript, Node.js, and Express app in TypeScript for stronger type safety and better developer experience.
- Learn server setup, routing, database integration, authentication, request validation, and deployment best practices.

## 💻 Development & Context
- This project was built while following along with a vanilla JavaScript backend tutorial. To challenge myself and deepen my learning, **I decided to completely rewrite the entire application in TypeScript from scratch**.
- Translating the JavaScript tutorial code into TypeScript required configuring compiler settings, defining strict data interfaces, managing types for Express request/response objects, and ensuring strict type safety across the database layer.

## 📦 What’s included

- 🛤️ **Express** server and organized routes
- 🗄️ **PostgreSQL** connection with **Prisma ORM**
- 🔐 User registration and login with **JWT** authentication and **bcrypt**
- ⚙️ Controllers and middleware to separate business logic and validation (**Zod**)
- 🛡️ **TypeScript** throughout for safer, more maintainable code

## ❓ Why this project?

It is designed to be a practical, end-to-end backend training exercise. Taking a standard JavaScript tutorial and adapting it to TypeScript served as an excellent way to accelerate my fullstack learning, troubleshoot real-world type errors, and establish stronger code quality habits early on.

# 🚀 Getting Started
Follow these steps to set up and run this project locally on your machine.
## 📋 Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- PostgreSQL database running locally or hosted online (e.g., Supabase, Neon)
- npm or yarn package manager

## 🛠️ Installation & Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables by createing a .env file in the root directory of your project. Refer to the .env-sample as guide.
4. This project uses Prisma ORM. Run the following command to sync the database schema with your PostgreSQL database: `npx prisma migrate dev --name init`
5. Start the development server: `npm run dev`
