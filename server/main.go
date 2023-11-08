package main

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func loadEnv() {
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

func main() {
	loadEnv()
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run()
}
