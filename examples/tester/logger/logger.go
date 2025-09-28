package logger

import (
    "os"

    "github.com/sirupsen/logrus"
)

var Log = logrus.New()

func init() {
    // Log as JSON instead of the default ASCII formatter.
    Log.SetFormatter(&logrus.JSONFormatter{})

    // Output to stdout instead of the default stderr
    Log.SetOutput(os.Stdout)

    // Only log the warning severity or above.
    Log.SetLevel(logrus.InfoLevel)
}

