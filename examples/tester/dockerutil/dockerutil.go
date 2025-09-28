
package dockerutil

import (
    "context"
    "log"
    "time"

    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/wait"
)

var container testcontainers.Container

func StartPostgresContainer() (string, error) {
    ctx := context.Background()
    req := testcontainers.ContainerRequest{
        Image:        "postgres:latest",
        ExposedPorts: []string{"5432/tcp"},
        Env: map[string]string{
            "POSTGRES_PASSWORD": "secret",
            "POSTGRES_USER":     "postgres",
            "POSTGRES_DB":       "testdb",
        },
        WaitingFor: wait.ForLog("database system is ready to accept connections").WithStartupTimeout(60 * time.Second),
    }

    postgres, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
        ContainerRequest: req,
        Started:          true,
    })
    if err != nil {
        return "", err
    }

    // Store the container globally to allow stopping it later
    container = postgres

    // Get the host and port
    host, err := postgres.Host(ctx)
    if err != nil {
        return "", err
    }

    mappedPort, err := postgres.MappedPort(ctx, "5432")
    if err != nil {
        return "", err
    }

    // Build the connection string
    dsn := "postgres://postgres:secret@" + host + ":" + mappedPort.Port() + "/testdb?sslmode=disable"
    log.Printf("Postgres DSN: %s\n", dsn)
    // Schedule a cleanup after 5 minutes of inactivity
    go func() {
        time.Sleep(2 * time.Minute)
        StopPostgresContainer()
    }()

    return dsn, nil
}

func StopPostgresContainer() {
    if container != nil {
        ctx := context.Background()
        if err := container.Terminate(ctx); err != nil {
            log.Printf("Failed to terminate container: %v\n", err)
        } else {
            log.Printf("Successfully terminated container\n")
        }
        container = nil
    }
}

