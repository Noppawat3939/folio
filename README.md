# folio

Personal monthly investment tracker — บันทึกรายการลงทุนรายเดือน (เงินสำรอง, หุ้น, กองทุน, ประกัน) ดูข้อมูลแบบรายเดือน/รายปีได้ ไม่มี real-time price หรือ P&L

**Demo:** [folio-five-mu.vercel.app](https://folio-five-mu.vercel.app)

## Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Frontend         | React + Vite (TypeScript) |
| Backend          | Go                      |
| Database         | Turso (LibSQL / SQLite) |
| Repository       | Monorepo                |
| Deploy           | Render                  |
| Primary currency | THB                     |

## Project Structure

```
folio/
├── backend/
│   ├── cmd/main.go
│   ├── internal/
│   │   ├── handler/
│   │   ├── service/
│   │   ├── repository/
│   │   └── model/
│   ├── config/
│   ├── .env.example
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Go 1.22+
- Node.js 22+
- Turso account + CLI ([turso.tech](https://turso.tech))

### Environment Variables

```bash
# backend/.env
API_TOKEN=your_static_token
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# frontend/.env
VITE_API_TOKEN=your_static_token
VITE_API_BASE_URL=http://localhost:8080
```

### Run locally

```bash
# Backend
cd backend
cp .env.example .env
go run cmd/main.go

# Frontend
cd frontend
npm install
npm run dev
```

## Authentication

ใช้ Static Bearer Token — single user, ไม่มี login UI

```
Authorization: Bearer <token>
```

`GET /health` เป็น public endpoint (ใช้กับ UptimeRobot เพื่อป้องกัน Render cold start)

## Key Design Decisions

- `amount` เก็บเป็น **satang** (INTEGER) — 35,000 THB = 3,500,000 satang
- `period` เก็บเป็น **YYYY-MM-01** (TEXT) — วันแรกของเดือน
- `type` เป็น **free-text** — ไม่ใช่ enum, ค่า default แสดงเป็น quick-select ใน UI
- Soft delete ผ่าน `deleted_at` — กู้คืนได้

## License

MIT
