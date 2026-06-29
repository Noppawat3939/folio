package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"folio/internal/model"
	"folio/internal/service"
	"net/http"
)

type EntryHandler struct {
	service *service.EntryService
}

func NewEntryHandler(service *service.EntryService) *EntryHandler {
	return &EntryHandler{service: service}
}

type apiResponse struct {
	Success bool   `json:"success"`
	Data    any    `json:"data"`
	Error   string `json:"error,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(apiResponse{Success: true, Data: data})
}

func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(apiResponse{Success: false, Data: nil, Error: msg})
}

// GET /api/entries?period=YYYY-MM-01
// Returns all entries for the given month (period is required)
func (h *EntryHandler) GetByPeriod(w http.ResponseWriter, r *http.Request) {
	period := r.URL.Query().Get("period")
	if period == "" {
		writeError(w, http.StatusBadRequest, "period is required")
		return
	}
	entries, err := h.service.GetByPeriod(r.Context(), period)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, entries)
}

// GET /api/entries/{id}
// Returns a single entry by ID (used for pre-filling edit form)
func (h *EntryHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	entry, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "entry not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, entry)
}

// POST /api/entries
// Creates a new entry — validates type, amount, period before inserting
func (h *EntryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var entry model.Entry
	if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	created, err := h.service.Create(r.Context(), entry)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

// PUT /api/entries/{id}
// Updates an existing entry — if period changes, entry moves to new month view
func (h *EntryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var entry model.Entry
	if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	updated, err := h.service.Update(r.Context(), id, entry)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "entry not found")
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

// PATCH /api/entries/{id}
// Updates only the provided fields of an existing entry
func (h *EntryHandler) Patch(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var patch model.PatchEntry
	if err := json.NewDecoder(r.Body).Decode(&patch); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	updated, err := h.service.Patch(r.Context(), id, patch)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "entry not found")
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

// DELETE /api/entries/{id}
// Soft-deletes an entry by setting deleted_at (recoverable)
func (h *EntryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.service.Delete(r.Context(), id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "entry not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, nil)
}

// GET /api/entries/yearly?year=YYYY
// Returns all entries for the given year ordered by period
func (h *EntryHandler) GetByYear(w http.ResponseWriter, r *http.Request) {
	year := r.URL.Query().Get("year")
	if year == "" {
		writeError(w, http.StatusBadRequest, "year is required")
		return
	}
	entries, err := h.service.GetByYear(r.Context(), year)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, entries)
}

// GET /api/summary/monthly?period=YYYY-MM-01
// Returns total amount per type for the given month (period is required)
func (h *EntryHandler) GetMonthlySummary(w http.ResponseWriter, r *http.Request) {
	period := r.URL.Query().Get("period")
	if period == "" {
		writeError(w, http.StatusBadRequest, "period is required")
		return
	}
	summaries, err := h.service.GetMonthlySummary(r.Context(), period)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, summaries)
}

// GET /api/summary/yearly?year=YYYY
// Returns total amount per month for the given year
func (h *EntryHandler) GetYearlySummary(w http.ResponseWriter, r *http.Request) {
	year := r.URL.Query().Get("year")
	if year == "" {
		writeError(w, http.StatusBadRequest, "year is required")
		return
	}
	summaries, err := h.service.GetYearlySummary(r.Context(), year)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, summaries)
}
