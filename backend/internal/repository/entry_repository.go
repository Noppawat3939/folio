package repository

import (
	"context"
	"database/sql"
	"folio/internal/model"
	"time"
)

type EntryRepository struct {
	db *sql.DB
}

func NewEntryRepository(db *sql.DB) *EntryRepository {
	return &EntryRepository{db: db}
}

// GetByPeriod returns all active entries for a given period (YYYY-MM-01)
func (r *EntryRepository) GetByPeriod(ctx context.Context, period string) ([]model.Entry, error) {
	query := `SELECT id, name, type, amount, period, note, deleted_at, created_at, updated_at
	          FROM entries
	          WHERE period = ? AND deleted_at IS NULL`

	rows, err := r.db.QueryContext(ctx, query, period)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []model.Entry
	for rows.Next() {
		var e model.Entry
		if err := rows.Scan(&e.ID, &e.Name, &e.Type, &e.Amount, &e.Period, &e.Note, &e.DeletedAt, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}

	return entries, rows.Err()
}

// GetByID returns a single active entry by ID
func (r *EntryRepository) GetByID(ctx context.Context, id string) (*model.Entry, error) {
	query := "SELECT id, name, type, amount, period, note, deleted_at, created_at, updated_at FROM entries WHERE id = ?"

	var data model.Entry

	err := r.db.QueryRowContext(ctx, query, id).
		Scan(&data.ID,
			&data.Name,
			&data.Type,
			&data.Amount,
			&data.Period,
			&data.Note,
			&data.DeletedAt,
			&data.CreatedAt,
			&data.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return &data, nil
}

// Create inserts a new entry and returns the created record
func (r *EntryRepository) Create(ctx context.Context, entry model.Entry) (*model.Entry, error) {
	query := `INSERT INTO entries (id, name, type, amount, period, note, created_at, updated_at)
	          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	now := time.Now()
	entry.CreatedAt = now
	entry.UpdatedAt = now

	_, err := r.db.ExecContext(ctx, query,
		entry.ID,
		entry.Name,
		entry.Type,
		entry.Amount,
		entry.Period,
		entry.Note,
		entry.CreatedAt,
		entry.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &entry, nil
}

// Update modifies an existing entry by ID and returns the updated record
func (r *EntryRepository) Update(ctx context.Context, id string, entry model.Entry) (*model.Entry, error) {
	query := `UPDATE entries
	          SET name = ?, type = ?, amount = ?, period = ?, note = ?, updated_at = ?
	          WHERE id = ? AND deleted_at IS NULL`

	entry.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		entry.Name,
		entry.Type,
		entry.Amount,
		entry.Period,
		entry.Note,
		entry.UpdatedAt,
		id,
	)
	if err != nil {
		return nil, err
	}

	entry.ID = id
	return &entry, nil
}

// Delete soft-deletes an entry by setting deleted_at to current timestamp
func (r *EntryRepository) Delete(ctx context.Context, id string) error {
	query := `UPDATE entries SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL`

	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	return err
}

// GetByYear returns all active entries for a given year (YYYY)
func (r *EntryRepository) GetByYear(ctx context.Context, year string) ([]model.Entry, error) {
	query := `SELECT id, name, type, amount, period, note, deleted_at, created_at, updated_at
	          FROM entries
	          WHERE strftime('%Y', period) = ? AND deleted_at IS NULL
	          ORDER BY period`

	rows, err := r.db.QueryContext(ctx, query, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []model.Entry
	for rows.Next() {
		var e model.Entry
		if err := rows.Scan(&e.ID, &e.Name, &e.Type, &e.Amount, &e.Period, &e.Note, &e.DeletedAt, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}

	return entries, rows.Err()
}

// GetMonthlySummary returns total amount per type for a given period (YYYY-MM-01)
func (r *EntryRepository) GetMonthlySummary(ctx context.Context, period string) ([]model.MonthlySummary, error) {
	query := `SELECT type, SUM(amount) AS total, period
	          FROM entries
	          WHERE period = ? AND deleted_at IS NULL
	          GROUP BY type`

	rows, err := r.db.QueryContext(ctx, query, period)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []model.MonthlySummary
	for rows.Next() {
		var s model.MonthlySummary
		if err := rows.Scan(&s.Type, &s.Total, &s.Period); err != nil {
			return nil, err
		}
		summaries = append(summaries, s)
	}

	return summaries, rows.Err()
}

// GetYearlySummary returns total amount per month for a given year (YYYY)
func (r *EntryRepository) GetYearlySummary(ctx context.Context, year string) ([]model.YearlySummary, error) {
	query := `SELECT period, SUM(amount) AS total
	          FROM entries
	          WHERE strftime('%Y', period) = ? AND deleted_at IS NULL
	          GROUP BY period
	          ORDER BY period`

	rows, err := r.db.QueryContext(ctx, query, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []model.YearlySummary
	for rows.Next() {
		var s model.YearlySummary
		if err := rows.Scan(&s.Period, &s.Total); err != nil {
			return nil, err
		}
		summaries = append(summaries, s)
	}

	return summaries, rows.Err()
}
