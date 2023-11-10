package api

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func LoadEnv() {
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}
	var file = ".env.development"
	switch env {
	case "development":
		file = ".env.development"
	case "production":
		file = ".env.production"
	case "test":
		file = ".env.test"
	}

	godotenv.Load("../" + file)
}

func SetupRouter() *gin.Engine {
	r := gin.Default()
	LoadAuthRoutes(r)
	return r
}
