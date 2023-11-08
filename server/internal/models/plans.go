package models

import (
	"time"
)

type Plan struct {
	Id        int64     `db:"id"`
	Name      string    `db:"name"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

func CreatePlan(name string, exercises []string) {
	// db := GetConnection()
	//  tx := db.MustBegin()
	// row := db.QueryRowx("INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id, email, created_at, updated_at", email, hash)
	// var user User
	// err = row.StructScan(&user)
	// return user, err
}

func FetchPlans(email string, password string) {
	// db := GetConnection()
	// row := db.QueryRowx("SELECT id, email, password, created_at, updated_at from users WHERE email=$1", email)
	// var user UserWithPassword
	// err := row.StructScan(&user)
	// if err != nil {
	// 	return User{}, err
	// }
	// return User{
	// 	Id:        user.Id,
	// 	Email:     user.Email,
	// 	CreatedAt: user.CreatedAt,
	// 	UpdatedAt: user.UpdatedAt,
	// }, nil
}
