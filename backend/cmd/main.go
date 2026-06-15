package main

import (
	"context"
	"encoding/json"
	"fmt"
	"folio/db"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

var (
	PORT       string
	REMOTE_URL string
	AUTH_TOKEN string
)

func init() {
	// load configs
	err := godotenv.Load(".env.staging", ".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	PORT = os.Getenv("PORT")
	REMOTE_URL = os.Getenv("TURSO_DATABASE_URL")
	AUTH_TOKEN = os.Getenv("TURSO_AUTH_TOKEN")
}

type Response struct {
	ServerConnected   bool   `json:"server_connected"`
	DatabaseConnected bool   `json:"database_connected"`
	Message           string `json:"message"`
}

func main() {
	ctx := context.Background()

	_, err := db.Connect(ctx, REMOTE_URL, AUTH_TOKEN)

	// 1. Define a route handler
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, World!")
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json") // Must be set first

		dbConnectFailed := err != nil
		var msg string = "Server and Database already connections"
		if dbConnectFailed {
			msg = "Database connection failed"
		}

		data := Response{ServerConnected: true, DatabaseConnected: err == nil, Message: msg}
		fmt.Println(data)
		json.NewEncoder(w).Encode(data) // Efficient streaming
	})

	// 2. Start the server on port 8080
	fmt.Printf("Server is running on http://localhost:%s", PORT)
	log.Fatal(http.ListenAndServe(":"+PORT, nil))
}
