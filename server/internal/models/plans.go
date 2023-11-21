package models

import (
	"encoding/json"
	"fmt"
	"time"
)

type Plan struct {
	Id        int64         `db:"id" json:"id"`
	Name      string        `db:"name" json:"name"`
	UserId    int64         `db:"user_id" json:"user_id"`
	CreatedAt time.Time     `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time     `db:"updated_at" json:"updatedAt"`
	Exercises PlanExercises `db:"exercises" json:"exercises"`
}

type PlanExercise struct {
	Id               string   `json:"id"`
	Aliases          []string `json:"aliases"`
	Category         string   `json:"category"`
	Description      string   `json:"description"`
	Equipment        string   `json:"equipment"`
	Force            string   `json:"force"`
	Instructions     []string `json:"instructions"`
	Level            string   `json:"level"`
	Mechanic         string   `json:"mechanic"`
	Name             string   `json:"name"`
	PrimaryMuscles   []string `json:"primary_muscles"`
	SecondaryMuscles []string `json:"secondary_muscles"`
	Tips             []string `json:"tips"`
}

type PlanExercises []PlanExercise

func (u *PlanExercises) Scan(v interface{}) error {
	switch vv := v.(type) {
	case []byte:
		return json.Unmarshal(vv, u)
	case string:
		return json.Unmarshal([]byte(vv), u)
	default:
		return fmt.Errorf("unsupported type: %T", v)
	}
}

func CreatePlan(name string, exercises []string, user_id int64) error {
	db := GetConnection()
	tx := db.MustBegin()
	res := tx.QueryRow("INSERT INTO plans(name, user_id) values ($1, $2) RETURNING id", name, user_id)
	var id int64
	err := res.Scan(&id)
	if err != nil {
		return err
	}
	for _, exercise := range exercises {
		_, err = tx.Exec("INSERT INTO plan_exercises(plan_id, exercise_id, user_id) VALUES ($1, $2, $3)", id, exercise, user_id)
		if err != nil {
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}

func FetchPlansOfUser(user_id int64) ([]Plan, error) {
	db := GetConnection()
	var plans []Plan
	err := db.Select(&plans, `
    SELECT p.*, COALESCE(json_agg(row_to_json(e)) FILTER (WHERE e.id IS NOT NULL), '[]') as exercises
    FROM plans p
      LEFT JOIN plan_exercises pe ON pe.plan_id = p.id 
      LEFT JOIN exercises e ON pe.exercise_id = e.id
    GROUP BY p.id, pe.plan_id
    `)
	if err != nil {
		return []Plan{}, err
	}
	return plans, nil
}
