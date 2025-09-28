package main

import (
	"fmt"
	"net/http"
	"time"
	"runtime"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"tester/handlers"
	"tester/logger"   
)

func main() {
	fmt.Println("Application Starting...")

	// Get the server's hostname and port
	hostname, err := os.Hostname()
	if err != nil {
		logger.Log.Errorf("Failed to get hostname: %v", err)
		hostname = "unknown"
	}
	port := ":8080"


	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.POST("/test", handlers.TestHandler)
	router.GET("/health", func(c *gin.Context) {
        c.String(http.StatusOK, "OK")
    })

	fmt.Printf("Server Running...\n")
	fmt.Printf("Hostname: %s\n", hostname)
	fmt.Printf("Port: %s\n", port)
	fmt.Printf("Go Version: %s\n", runtime.Version())
	fmt.Printf("OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
	fmt.Printf("PID: %d\n", os.Getpid())
	fmt.Printf("Access the server at: http://%s%s\n", hostname, port)


	if err := router.Run(port); err != nil {
		logger.Log.Fatalf("Failed to run server: %v", err)
	}
}
