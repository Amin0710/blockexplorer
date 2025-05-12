# Block Explorer

A compact full-stack blockchain explorer built with React, TypeScript, PostgreSQL, and Prisma. It uses the Blockchair API and follows a persist-then-serve model with real-time stats via SSE.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Environment Setup

```bash
cp .env.example .env
```

Required environment variables:
DATABASE_URL="postgresql://devuser:devpass@localhost:5432/blockexplorer"
BLOCKCHAIR_API_URL="https://api.blockchair.com/stats"

# Start backend and database

docker-compose up -d

# Run DB migrations

docker-compose exec backend npx prisma migrate deploy

⚙️ Architecture
Frontend: React + React Router v7 (framework mode)
Styling: Tailwind CSS + Shadcn UI
Backend: Node.js + Express + Prisma + PostgreSQL
Routing: File-based with route loaders
Realtime: /events/stats SSE endpoint updates every 60 seconds

🗄️ Database Choice
PostgreSQL chosen over SQLite for:
Scalability & concurrency
Better support for joins, indexing, JSON

Prisma used for:
Type-safe DB queries
Smooth migrations
Native TypeScript support

📉 API Quota Management
Blockchair free-tier:

⏱ 1 request per minute per endpoint

📄 Max 100 rows
Strategy
All fetches happen server-side (no client API access)
Cached in Postgres and served to frontend
Global stats: pulled every 60s
Transactions: pulled every minute for BTC and ETH (latest 10 mins, max 100)

✅ Testing
Unit Tests
Located in test/Wallet.test.ts
Covers:
Successful loader execution
Missing address error

npm run test
