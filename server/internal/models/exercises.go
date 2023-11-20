package models

import (
	"database/sql"
	"time"

	"github.com/lib/pq"
)

type Exercises struct {
	Id               string         `db:"id"`
	Name             string         `db:"name"`
	Aliases          pq.StringArray `db:"aliases"`
	PrimaryMuscles   pq.StringArray `db:"primary_muscles"`
	SecondaryMuscles pq.StringArray `db:"secondary_muscles"`
	Force            sql.NullString `db:"force"`
	Level            string         `db:"level"`
	Mechanic         sql.NullString `db:"mechanic"`
	Equipment        sql.NullString `db:"equipment"`
	Category         string         `db:"category"`
	Instructions     pq.StringArray `db:"instructions"`
	Description      sql.NullString `db:"description"`
	Tips             pq.StringArray `db:"tips"`
	CreatedAt        time.Time      `db:"date_created"`
	UpdatedAt        time.Time      `db:"date_updated"`
}

func FilterExercises(search string, limit int, offset int) ([]Exercises, error) {
	db := GetConnection()
	var exercises []Exercises
	var err error
	if limit != 0 {
		err = db.Select(&exercises, "SELECT id, name, aliases, primary_muscles, secondary_muscles, force, level, mechanic, category, instructions, description, tips, date_created, date_updated  FROM exercises WHERE name ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3", search, limit, offset)
	} else {
		err = db.Select(&exercises, "SELECT id, name, aliases, primary_muscles, secondary_muscles, force, level, mechanic, category, instructions, description, tips, date_created, date_updated FROM exercises WHERE name ILIKE $1", search)
	}

	return exercises, err
}
