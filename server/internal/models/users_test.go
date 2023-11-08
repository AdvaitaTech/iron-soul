package models

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
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

	godotenv.Load("../../" + file)
}

func TestUsersModel(t *testing.T) {
	t.Run("should create a user", func(t *testing.T) {
		user, err := CreateUser("testing@example.com", "testing@123")
		assert.Equal(t, err, nil)
		assert.Equal(t, user.Email, "testing@example.com")
	})

	t.Run("should fetch a user via credentials", func(t *testing.T) {
		user, err := FetchUserWithCredentials("testing@example.com", "testing@123")
		assert.Equal(t, err, nil)
		assert.Equal(t, user.Email, "testing@example.com")
	})

	t.Run("should throw error on fetch a user via credentials", func(t *testing.T) {
		user, err := FetchUserWithCredentials("testing@example.com", "fail")
		assert.NotEqual(t, err, nil)
		assert.Equal(t, user, User{})
	})
}

func TestMain(m *testing.M) {
	loadEnv()
	code := m.Run()
	os.Exit(code)
}
