package service

import (
	"context"
	"folio/internal/model"
	"folio/internal/repository"
)

type EntryService struct {
	repo *repository.EntryRepository
}

func NewEntryService(repo *repository.EntryRepository) *EntryService {
	return &EntryService{repo: repo}
}

// GetByPeriod validates period format then returns entries for that month
func (s *EntryService) GetByPeriod(ctx context.Context, period string) ([]model.Entry, error) {
	panic("not implemented")
}

// GetByID returns a single entry by ID
func (s *EntryService) GetByID(ctx context.Context, id string) (*model.Entry, error) {
	panic("not implemented")
}

// Create validates input then creates a new entry with a generated UUID
func (s *EntryService) Create(ctx context.Context, entry model.Entry) (*model.Entry, error) {
	panic("not implemented")
}

// Update validates input then updates an existing entry
func (s *EntryService) Update(ctx context.Context, id string, entry model.Entry) (*model.Entry, error) {
	panic("not implemented")
}

// Delete soft-deletes an entry by ID
func (s *EntryService) Delete(ctx context.Context, id string) error {
	panic("not implemented")
}

// GetMonthlySummary returns total per type for a given month
func (s *EntryService) GetMonthlySummary(ctx context.Context, period string) ([]model.MonthlySummary, error) {
	panic("not implemented")
}

// GetYearlySummary returns total per month for a given year
func (s *EntryService) GetYearlySummary(ctx context.Context, year string) ([]model.YearlySummary, error) {
	panic("not implemented")
}
