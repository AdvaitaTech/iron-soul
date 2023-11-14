package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type Workout struct {
	Id        int64         `db:"id"`
	UserId    int64         `db:"user_id"`
	PlanId    sql.NullInt64 `db:"plan_id"`
	CreatedAt time.Time     `db:"created_at"`
	UpdatedAt time.Time     `db:"updated_at"`
	Sets      WorkoutSets   `db:"sets"`
}

type WorkoutSet struct {
	WorkoutId  int64  `json:"workout_id"`
	Name       string `json:"name"`
	ExerciseId string `json:"exercise_id"`
	Weight     int64  `json:"weight"`
	Reps       int64  `json:"reps"`
}

type WorkoutSets []WorkoutSet

func (u *WorkoutSets) Scan(v interface{}) error {
	switch vv := v.(type) {
	case []byte:
		return json.Unmarshal(vv, u)
	case string:
		return json.Unmarshal([]byte(vv), u)
	default:
		return fmt.Errorf("unsupported type: %T", v)
	}
}

type SetParams struct {
	ExerciseId string `json:"exercise_id"`
	Weight     int64  `json:"weight"`
	Reps       int64  `json:"reps"`
}

func CreateWorkout(sets []SetParams, user_id int64, plan_id sql.NullInt64) error {
	db := GetConnection()
	tx := db.MustBegin()
	var res *sql.Row
	if plan_id.Valid {
		res = tx.QueryRow("INSERT INTO workouts(user_id, plan_id) values ($1, $2) RETURNING id", user_id, plan_id.Int64)
	} else {
		res = tx.QueryRow("INSERT INTO workouts(user_id) values ($1) RETURNING id", user_id)
	}
	var id int64
	err := res.Scan(&id)
	if err != nil {
		log.Printf("got workout create err %s", err.Error())
		return err
	}
	for i, set := range sets {
		log.Printf("creating workout set %d, %d, %d", i, id, user_id)
		_, err = tx.Exec("INSERT INTO workout_sets(workout_id, user_id, exercise_id, weight, reps) VALUES ($1, $2, $3, $4, $5)", id, user_id, set.ExerciseId, set.Weight, set.Reps)
		if err != nil {
			log.Printf("got workout set create err %#v %s", set, err.Error())
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}

func FetchWorkoutsOfUser(user_id int64, limit int64, offset int64) ([]Workout, error) {
	db := GetConnection()
	var workouts []Workout
	err := db.Select(&workouts, `
    SELECT w.*, COALESCE(json_agg(json_build_object(
      'workout_id', ws.workout_id,
      'exercise_id', ws.exercise_id,
      'name', e.name,
      'weight', ws.weight,
      'reps', ws.reps
    )) FILTER (WHERE ws.id IS NOT NULL), '[]') as sets
    FROM workouts w
      JOIN workout_sets ws ON ws.workout_id = w.id AND w.user_id = $1
      JOIN exercises e ON ws.exercise_id = e.id
    GROUP BY w.id, ws.workout_id
    ORDER BY w.created_at
    LIMIT $2 OFFSET $3
    `, user_id, limit, offset)
	if err != nil {
		return []Workout{}, err
	}
	return workouts, nil
}
