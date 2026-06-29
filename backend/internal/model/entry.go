package model

import "time"

type Entry struct {
	ID        string     `json:"id"`
	Name      *string    `json:"name"`
	Type      string     `json:"type"`
	Amount    int64      `json:"amount"`
	Period    string     `json:"period"`
	Note      *string    `json:"note"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type PatchEntry struct {
	Name   *string `json:"name"`
	Type   *string `json:"type"`
	Amount *int64  `json:"amount"`
	Period *string `json:"period"`
	Note   *string `json:"note"`
}

// MonthlySummary represents total amount per type for a given month
type MonthlySummary struct {
	Type   string `json:"type"`
	Total  int64  `json:"total"`
	Period string `json:"period"`
}

// YearlySummary represents total amount per month for a given year
type YearlySummary struct {
	Period string `json:"period"`
	Total  int64  `json:"total"`
}
