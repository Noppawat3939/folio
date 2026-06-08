# folio

Personal investment tracker — stocks and cash portfolio with Google Sheets as the database.

## Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Frontend | React + Vite (TypeScript) |
| Backend  | Go                        |
| Database | Google Sheets API         |
| Deploy   | Render                    |

## Project Structure

```
folio/
├── backend/
│   ├── cmd/main.go
│   ├── internal/
│   │   ├── handler/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   └── price/
│   ├── config/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Go 1.22+
- Node.js 22+
- Google Sheets API credentials

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

## License

MIT
