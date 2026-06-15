package handler

import (
	"folio/internal/service"
	"net/http"
)

type EntryHandler struct {
	service *service.EntryService
}

func NewEntryHandler(service *service.EntryService) *EntryHandler {
	return &EntryHandler{service: service}
}

// GET /api/entries?period=YYYY-MM-01
// Returns all entries for the given month (period is required)
func (h *EntryHandler) GetByPeriod(w http.ResponseWriter, r *http.Request) {
	panic("not implemented")
}

// GET /api/entries/:id
// Returns a single entry by ID (used for pre-filling edit form)
func (h *EntryHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	panic("not implemented")
}

// POST /api/entries
// Creates a new entry — validates type, amount, period before inserting
func (h *EntryHandler) Create(w http.ResponseWriter, r *http.Request) {
	panic("not implemented")
}

// PUT /api/entries/:id
// Updates an existing entry — if period changes, entry moves to new month view
func (h *EntryHandler) Update(w http.ResponseWriter, r *http.Request) {
	panic("not implemented")
}

// DELETE /api/entries/:id
// Soft-deletes an entry by setting deleted_at (recoverable)
func (h *EntryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	panic("not implemented")
}

// GET /api/summary/monthly?period=YYYY-MM-01
// Returns total amount per type for the given month (period is required)
func (h *EntryHandler) GetMonthlySummary(w http.ResponseWriter, r *http.Request) {
	panic("not implemented")
}

// GET /api/summary/yearly?year=YYYY
// Returns total amount per month for the given year
func (h *EntryHandler) GetYearlySummary(w http.ResponseWriter, r *http.Request) {
	panic("not implemented")
}
