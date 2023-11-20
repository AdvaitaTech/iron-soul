package models

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
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

func GetArrayFromPgArray(arr pq.StringArray) []string {
	var res []string
	for _, val := range arr {
		res = append(res, val)
	}
	return res
}

func GetStringFromNullString(s sql.NullString) string {
	if s.Valid {
		return s.String
	} else {
		return ""
	}
}
