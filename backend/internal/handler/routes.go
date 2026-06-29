package handler

import (
	"bytes"
	"encoding/json"
	"folio/internal/cache"
	"net/http"
	"time"
)

func RegisterRoutes(mux *http.ServeMux, h *EntryHandler, apiToken string) {
	entryCache := cache.New[string, []byte](30 * time.Minute)

	api := http.NewServeMux()
	api.HandleFunc("GET /api/entries", h.GetByPeriod)
	api.HandleFunc("GET /api/entries/yearly", h.GetByYear)
	api.HandleFunc("GET /api/entries/{id}", cacheGet(entryCache, h.GetByID))
	api.HandleFunc("POST /api/entries", h.Create)
	api.HandleFunc("PUT /api/entries/{id}", invalidateEntry(entryCache, h.Update))
	api.HandleFunc("DELETE /api/entries/{id}", invalidateEntry(entryCache, h.Delete))
	api.HandleFunc("GET /api/summary/monthly", h.GetMonthlySummary)
	api.HandleFunc("GET /api/summary/yearly", h.GetYearlySummary)

	mux.Handle("/api/", authMiddleware(apiToken, api))
}

type responseRecorder struct {
	http.ResponseWriter
	status int
	body   *bytes.Buffer
}

func (r *responseRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}

func cacheGet(c *cache.Cache[string, []byte], next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.URL.Path
		if data, ok := c.Get(key); ok {
			w.Header().Set("Content-Type", "application/json")
			w.Write(data)
			return
		}
		rec := &responseRecorder{ResponseWriter: w, status: http.StatusOK, body: &bytes.Buffer{}}
		next(rec, r)
		if rec.status < 300 {
			c.Set(key, rec.body.Bytes())
		}
	}
}

func invalidateEntry(c *cache.Cache[string, []byte], next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		next(w, r)
		c.Delete("/api/entries/" + r.PathValue("id"))
	}
}

func authMiddleware(token string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer "+token {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
			return
		}
		next.ServeHTTP(w, r)
	})
}
