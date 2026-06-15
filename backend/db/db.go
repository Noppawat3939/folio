package db

import (
	"context"
	"log"

	turso "turso.tech/database/tursogo"
)

func Connect(ctx context.Context, remoteUrl, authToken string) (*turso.TursoSyncDb, error) {
	syncDb, _ := turso.NewTursoSyncDb(ctx, turso.TursoSyncDbConfig{
		Path:      "app.db",
		RemoteUrl: remoteUrl,
		AuthToken: authToken,
	})

	db, err := syncDb.Connect(ctx)
	if err != nil {
		return nil, err
	}

	defer db.Close()

	// Push local writes to Turso Cloud
	syncDb.Push(ctx)

	// Pull remote changes to local database
	syncDb.Pull(ctx)

	log.Println("Database is connected")

	return syncDb, nil
}
