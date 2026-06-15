package database

import "database/sql"

func Migrate(db *sql.DB) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS entries (
			id          TEXT PRIMARY KEY,
			name        TEXT,
			type        TEXT NOT NULL,
			amount      INTEGER NOT NULL,
			period      TEXT NOT NULL,
			note        TEXT,
			deleted_at  DATETIME,
			created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE INDEX IF NOT EXISTS idx_entries_period ON entries(period)`,
		`CREATE TRIGGER IF NOT EXISTS entries_updated_at
		AFTER UPDATE ON entries
		FOR EACH ROW
		BEGIN
			UPDATE entries SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
		END`,
	}

	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}

	return nil
}
