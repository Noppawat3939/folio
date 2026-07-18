package main

import (
	"context"
	"encoding/json"
	"fmt"
	"folio/database"
	"folio/internal/handler"
	"folio/internal/repository"
	"folio/internal/service"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

var (
	PORT       string
	REMOTE_URL string
	AUTH_TOKEN string
	API_TOKEN  string
)

func init() {
	// .env files are optional — on production, env vars are set by the host
	_ = godotenv.Load(".env.staging", ".env")

	PORT = os.Getenv("PORT")
	REMOTE_URL = os.Getenv("TURSO_DATABASE_URL")
	AUTH_TOKEN = os.Getenv("TURSO_AUTH_TOKEN")
	API_TOKEN = os.Getenv("API_TOKEN")
}

type healthResponse struct {
	ServerConnected   bool   `json:"server_connected"`
	DatabaseConnected bool   `json:"database_connected"`
	Message           string `json:"message"`
}


func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	ctx := context.Background()

	syncDb, sqlDB, err := database.Connect(ctx, REMOTE_URL, AUTH_TOKEN)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := database.Migrate(sqlDB); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	syncDb.Push(ctx)

	// Wire dependencies
	entryRepo := repository.NewEntryRepository(sqlDB)
	entryService := service.NewEntryService(entryRepo)
	entryHandler := handler.NewEntryHandler(entryService)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, World!")
	})

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		msg := "Server and Database already connections"
		if err != nil {
			msg = "Database connection failed"
		}
		json.NewEncoder(w).Encode(healthResponse{
			ServerConnected:   true,
			DatabaseConnected: err == nil,
			Message:           msg,
		})
	})

	handler.RegisterRoutes(mux, entryHandler, API_TOKEN)

	fmt.Printf("Server is running on http://localhost:%s\n", PORT)
	log.Fatal(http.ListenAndServe(":"+PORT, corsMiddleware(mux)))
}
