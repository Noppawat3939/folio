# Bruno API Collection — Plan

Bruno collection สำหรับ test API ของ Folio backend
เก็บเป็นไฟล์ใน repo — ไม่ต้อง export/import เหมือน Postman

---

## Planned Folder Structure

```
bruno/
├── bruno.json              ← collection config + base URL env
└── folio-api/
    ├── health.bru          ← GET /health (public)
    ├── entries/
    │   ├── get-by-period.bru   ← GET /api/entries?period=YYYY-MM-01
    │   ├── get-by-id.bru       ← GET /api/entries/:id
    │   ├── create.bru          ← POST /api/entries
    │   ├── update.bru          ← PUT /api/entries/:id
    │   └── delete.bru          ← DELETE /api/entries/:id
    └── summary/
        ├── monthly.bru         ← GET /api/summary/monthly?period=YYYY-MM-01
        └── yearly.bru          ← GET /api/summary/yearly?year=YYYY
```

---

## Environment Variables (to configure in Bruno)

| Variable | Value |
|---|---|
| `base_url` | `http://localhost:8080` (local) |
| `api_token` | Bearer token from `API_TOKEN` env var |

---

## Notes

- ทุก request ยกเว้น `/health` ต้องแนบ header `Authorization: Bearer {{api_token}}`
- `period` format คือ `YYYY-MM-01` เสมอ เช่น `2026-06-01`
- `amount` ส่งเป็น satang (THB × 100) เช่น 35,000 บาท = `3500000`

---

## Status

- [ ] สร้าง collection ยังไม่ได้ implement — รอ handler พร้อมก่อน
