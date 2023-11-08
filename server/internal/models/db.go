package models

import (
	"fmt"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func GetConnection() *sqlx.DB {
	conn := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=disable", os.Getenv("DBUSER"), os.Getenv("DBPASSWORD"), os.Getenv("DBHOST"), os.Getenv("DBNAME"))
	db, err := sqlx.Open("postgres", conn)
	if err != nil {
		log.Fatalln(err)
	}
	return db
}
