package models

import (
	"golang.org/x/crypto/bcrypt"
	"time"
)

type User struct {
	Id        int64     `db:"id"`
	Email     string    `db:"email"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

type UserWithPassword struct {
	Id        int64     `db:"id"`
	Email     string    `db:"email"`
	Password  string    `db:"password"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

func CreateUser(email string, password string) (User, error) {
	db := GetConnection()
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return User{}, err
	}
	row := db.QueryRowx("INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id, email, created_at, updated_at", email, hash)
	var user User
	err = row.StructScan(&user)
	return user, err
}

func FetchUserWithCredentials(email string, password string) (User, error) {
	db := GetConnection()
	row := db.QueryRowx("SELECT id, email, password, created_at, updated_at from users WHERE email=$1", email)
	var user UserWithPassword
	err := row.StructScan(&user)
	if err != nil {
		return User{}, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return User{}, err
	} else {
		return User{
			Id:        user.Id,
			Email:     user.Email,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		}, nil
	}
}
