package db

import (
	"context"
	"log"

	turso "turso.tech/database/tursogo"
)

func Connect(ctx context.Context, remoteUrl, authToken string) (*turso.TursoSyncDb, error) {
	syncDb, err := turso.NewTursoSyncDb(ctx, turso.TursoSyncDbConfig{
		Path:      "app.db",
		RemoteUrl: remoteUrl,
		AuthToken: authToken,
	})
	if err != nil {
		return nil, err
	}

	_, err = syncDb.Connect(ctx)
	if err != nil {
		return nil, err
	}

	syncDb.Push(ctx)
	syncDb.Pull(ctx)

	log.Println("Database is connected")

	return syncDb, nil
}
