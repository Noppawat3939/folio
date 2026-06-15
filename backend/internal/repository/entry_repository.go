package repository

import (
	"context"
	"database/sql"
	"folio/internal/model"
)

type EntryRepository struct {
	db *sql.DB
}

func NewEntryRepository(db *sql.DB) *EntryRepository {
	return &EntryRepository{db: db}
}

// GetByPeriod returns all active entries for a given period (YYYY-MM-01)
func (r *EntryRepository) GetByPeriod(ctx context.Context, period string) ([]model.Entry, error) {
	panic("not implemented")
}

// GetByID returns a single active entry by ID
func (r *EntryRepository) GetByID(ctx context.Context, id string) (*model.Entry, error) {
	panic("not implemented")
}

// Create inserts a new entry and returns the created record
func (r *EntryRepository) Create(ctx context.Context, entry model.Entry) (*model.Entry, error) {
	panic("not implemented")
}

// Update modifies an existing entry by ID and returns the updated record
func (r *EntryRepository) Update(ctx context.Context, id string, entry model.Entry) (*model.Entry, error) {
	panic("not implemented")
}

// Delete soft-deletes an entry by setting deleted_at to current timestamp
func (r *EntryRepository) Delete(ctx context.Context, id string) error {
	panic("not implemented")
}

// GetMonthlySummary returns total amount per type for a given period (YYYY-MM-01)
func (r *EntryRepository) GetMonthlySummary(ctx context.Context, period string) ([]model.MonthlySummary, error) {
	panic("not implemented")
}

// GetYearlySummary returns total amount per month for a given year (YYYY)
func (r *EntryRepository) GetYearlySummary(ctx context.Context, year string) ([]model.YearlySummary, error) {
	panic("not implemented")
}
