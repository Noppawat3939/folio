package database

import (
	"context"
	"database/sql"
	"log"

	turso "turso.tech/database/tursogo"
)

func Connect(ctx context.Context, remoteUrl, authToken string) (*turso.TursoSyncDb, *sql.DB, error) {
	syncDb, err := turso.NewTursoSyncDb(ctx, turso.TursoSyncDbConfig{
		Path:      "app.db",
		RemoteUrl: remoteUrl,
		AuthToken: authToken,
	})
	if err != nil {
		return nil, nil, err
	}

	sqlDB, err := syncDb.Connect(ctx)
	if err != nil {
		return nil, nil, err
	}

	syncDb.Pull(ctx)

	log.Println("Database is connected")

	return syncDb, sqlDB, nil
}
