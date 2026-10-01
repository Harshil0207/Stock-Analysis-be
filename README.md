# Stock Market Backend - Authentication Module

A production-ready, highly secure, and scalable Authentication Module for a Stock Market Backend application. Built using Node.js, Express.js, and PostgreSQL.

## Features

- **Robust Database Integration**: PostgreSQL database access using native connection pooling (`pg` Pool).
- **Secure Authentication Flow**: Dual-token JWT (Access & Refresh tokens) with customizable expiry.
- **OTP Verification**: 6-digit OTP verification for Registration, Login, and Password Resets.
- **Enterprise-level Security**:
  - Helmet for security headers.
  - CORS with dynamic origin filtering.
  - Compression to optimize responses.
  - Rate limiting on API routes and specific limits on OTP resend requests.
  - BCrypt for secure password hashing.
  - Input validation using `express-validator`.
- **Winston Logger**: Clean logging of errors, database queries, and system events.

## Tech Stack

- Node.js (ES Modules)
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- Nodemailer
- express-validator
- winston & morgan

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database instance

### Setup

1. Clone the repository and navigate to the backend folder:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
