package handlers

import (
    "encoding/json"
    "net/http"
    "time"
    "tester/dockerutil"
    "tester/tests"
    "tester/logger"

    "github.com/gin-gonic/gin"
)

type TestRequest struct {
    Schema   string          `json:"schema"`
    MockData json.RawMessage `json:"mock_data"`
}

func TestHandler(c *gin.Context) {
    var req TestRequest

    // Parse JSON request
    if err := c.ShouldBindJSON(&req); err != nil {
        logger.Log.Error("Invalid JSON provided")
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON provided"})
        return
    }

    // Start Docker Container
    dsn, err := dockerutil.StartPostgresContainer()
    if err != nil {
        logger.Log.Error("Failed to start Docker container")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start Docker container"})
        return
    }
    defer dockerutil.StopPostgresContainer()

    // Wait for PostgreSQL to be ready
    time.Sleep(5 * time.Second)

    // Run Tests
    results, err := tests.RunTests(dsn, req.Schema, req.MockData)
    if err != nil {
        logger.Log.Error("Failed to run tests")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to run tests", "details": err.Error()})
        return
    }

    // Return results
    c.JSON(http.StatusOK, results)
}

