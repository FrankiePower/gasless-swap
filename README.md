# Gasless Swap Backend

A Node.js + TypeScript backend API for gasless token swaps. This project provides RESTful endpoints for users to swap tokens without paying for gas, using Express and Ethers.js.

## Features
- Express.js REST API
- MongoDB integration via Mongoose
- Ethers.js for blockchain interactions
- Environment-based configuration
- Ready for deployment on Render, Railway, or any Node.js host

## Requirements
- Node.js (>= v20)
- Yarn or npm
- MongoDB instance (local or remote)

## Getting Started

1. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in your environment variables (MongoDB URI, private keys, etc).

3. **Run in development:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```
   The server will start with hot-reloading using nodemon.

4. **Build and run in production:**
   ```bash
   yarn build
   yarn start
   # or
   npm run build
   npm start
   ```

## Project Structure
```
/ ├── src/        # Source code
│   ├── common/   # Shared config and utilities
│   ├── modules/  # API modules (controllers, routes, services, models)
│   └── index.ts  # Entry point
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## Deployment
- Deploy directly to Render, Railway, or any Node.js-compatible host.
- Set environment variables as needed for your deployment platform.

## License
ISC

---

> Originally based on a full-stack Scaffold-ETH 2 repo, now backend-only for easy deployment.