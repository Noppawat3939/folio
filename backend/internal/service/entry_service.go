package service

import (
	"context"
	"errors"
	"folio/internal/model"
	"folio/internal/repository"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type EntryService struct {
	repo *repository.EntryRepository
}

func NewEntryService(repo *repository.EntryRepository) *EntryService {
	return &EntryService{repo: repo}
}

// GetByPeriod validates period format then returns entries for that month
func (s *EntryService) GetByPeriod(ctx context.Context, period string) ([]model.Entry, error) {
	if err := validatePeriod(period); err != nil {
		return nil, err
	}
	return s.repo.GetByPeriod(ctx, period)
}

// GetByID returns a single entry by ID
func (s *EntryService) GetByID(ctx context.Context, id string) (*model.Entry, error) {
	if id == "" {
		return nil, errors.New("id is required")
	}
	return s.repo.GetByID(ctx, id)
}

// Create validates input then creates a new entry with a generated UUID
func (s *EntryService) Create(ctx context.Context, entry model.Entry) (*model.Entry, error) {
	if err := validateEntry(entry); err != nil {
		return nil, err
	}
	entry.ID = uuid.New().String()
	return s.repo.Create(ctx, entry)
}

// Update validates input then updates an existing entry
func (s *EntryService) Update(ctx context.Context, id string, entry model.Entry) (*model.Entry, error) {
	if id == "" {
		return nil, errors.New("id is required")
	}
	if err := validateEntry(entry); err != nil {
		return nil, err
	}
	return s.repo.Update(ctx, id, entry)
}

// Delete soft-deletes an entry by ID
func (s *EntryService) Delete(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("id is required")
	}
	return s.repo.Delete(ctx, id)
}

// GetByYear returns all entries for a given year
func (s *EntryService) GetByYear(ctx context.Context, year string) ([]model.Entry, error) {
	if err := validateYear(year); err != nil {
		return nil, err
	}
	return s.repo.GetByYear(ctx, year)
}

// GetMonthlySummary returns total per type for a given month
func (s *EntryService) GetMonthlySummary(ctx context.Context, period string) ([]model.MonthlySummary, error) {
	if err := validatePeriod(period); err != nil {
		return nil, err
	}
	return s.repo.GetMonthlySummary(ctx, period)
}

// GetYearlySummary returns total per month for a given year
func (s *EntryService) GetYearlySummary(ctx context.Context, year string) ([]model.YearlySummary, error) {
	if err := validateYear(year); err != nil {
		return nil, err
	}
	return s.repo.GetYearlySummary(ctx, year)
}

func validatePeriod(period string) error {
	t, err := time.Parse("2006-01-02", period)
	if err != nil || t.Day() != 1 {
		return errors.New("period must be in format YYYY-MM-01")
	}
	return nil
}

func validateYear(year string) error {
	if len(year) != 4 {
		return errors.New("year must be a 4-digit number")
	}
	if _, err := strconv.Atoi(year); err != nil {
		return errors.New("year must be a valid number")
	}
	return nil
}

func validateEntry(entry model.Entry) error {
	if entry.Type == "" {
		return errors.New("type is required")
	}
	if entry.Amount <= 0 {
		return errors.New("amount must be greater than 0")
	}
	if err := validatePeriod(entry.Period); err != nil {
		return err
	}
	return nil
}
