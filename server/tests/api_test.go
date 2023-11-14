package tests

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"iron.advaita.co/server/api"
	"iron.advaita.co/server/internal/models"
)

type ExerciseResponse struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	// Aliases          []string `json:"aliases"`
	PrimaryMuscles   []string `json:"primary_muscles"`
	SecondaryMuscles []string `json:"secondary_muscles"`
	Force            string   `json:"force"`
	Level            string   `json:"level"`
	Mechanic         string   `json:"mechanic"`
	Equipment        string   `json:"equipment"`
	Category         string   `json:"category"`
	// Instructions     []string `json:"instructions"`
	// Description string `json:"description"`
	// Tips             []string `json:"tips"`
}

type PlanResponse struct {
	Id        int64  `json:"id"`
	Name      string `json:"name"`
	Exercises []ExerciseResponse
}

// type SetResponse struct {
//
// }
// type WorkoutResponse struct {
//   PlanId int64 `json:"plan_id"`
//   Id int64 `json:"id"`
//   Sets []
// }

type AllExercisesResponse []ExerciseResponse
type AllPlanResponses []PlanResponse

func TestExercisesApi(t *testing.T) {
	api.LoadEnv()
	r := api.SetupRouter()
	register := CallRegisterApi(r, "testing210@example.com", "testing@123")

	t.Run("should fetch exercises by name", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/exercises?name=Bench+Press", nil)
		req.Header.Add("Authorization", register.Token)
		r.ServeHTTP(w, req)
		buf := new(bytes.Buffer)
		buf.ReadFrom(w.Body)
		var result AllExercisesResponse
		err := json.Unmarshal(buf.Bytes(), &result)
		assert.Equal(t, nil, err)
		assert.Equal(t, 200, w.Code)
		for _, ex := range result {
			assert.Contains(t, ex.Name, "Bench Press")
		}
	})

	t.Run("should create new plan", func(t *testing.T) {
		w := httptest.NewRecorder()
		jsonStr := []byte(`{"name": "p1", "exercises": ["b1345a14-a309-43ac-b9de-aef5120f04b2", "027fb70a-e288-4cf3-b6c1-8e05da0eb984"]}`)
		req, err := http.NewRequest("POST", "/plans", bytes.NewBuffer(jsonStr))
		req.Header.Add("Authorization", register.Token)
		req.Header.Add("Content-Type", "application/json")
		r.ServeHTTP(w, req)
		log.Printf("got api err %#v", err)
		assert.Equal(t, nil, err)
		assert.Equal(t, 200, w.Code)
	})

	t.Run("should list plans", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/plans", nil)
		req.Header.Add("Authorization", register.Token)
		r.ServeHTTP(w, req)
		buf := new(bytes.Buffer)
		buf.ReadFrom(w.Body)
		var result AllPlanResponses
		json_err := json.Unmarshal(buf.Bytes(), &result)
		assert.Equal(t, nil, err)
		assert.Equal(t, nil, json_err)
		assert.Equal(t, 200, w.Code)
		plan := result[0]
		assert.Contains(t, plan.Name, "p1")
		assert.Equal(t, "3/4 Sit-Up", plan.Exercises[0].Name)
		assert.Equal(t, "90/90 Hamstring", plan.Exercises[1].Name)
	})

	t.Run("should create a workout", func(t *testing.T) {
		w := httptest.NewRecorder()
		jsonStr := []byte(`{"plan_id": -1, "sets": [{"exercise_id": "b1345a14-a309-43ac-b9de-aef5120f04b2", "weight": 10, "reps": 20}, {"exercise_id": "027fb70a-e288-4cf3-b6c1-8e05da0eb984", "weight": 15, "reps": 25}]}`)
		req, err := http.NewRequest("POST", "/workouts", bytes.NewBuffer(jsonStr))
		req.Header.Add("Authorization", register.Token)
		req.Header.Add("Content-Type", "application/json")
		r.ServeHTTP(w, req)
		log.Printf("got error %#v", err)
		assert.Equal(t, nil, err)
		assert.Equal(t, 200, w.Code)
	})

	t.Run("should fetch workouts", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, err := http.NewRequest("GET", "/workouts", nil)
		req.Header.Add("Authorization", register.Token)
		r.ServeHTTP(w, req)
		buf := new(bytes.Buffer)
		buf.ReadFrom(w.Body)
		var result []models.Workout
		json_err := json.Unmarshal(buf.Bytes(), &result)
		assert.Equal(t, nil, err)
		assert.Equal(t, nil, json_err)
		assert.Equal(t, 200, w.Code)
		plan := result[0]
		assert.Equal(t, "3/4 Sit-Up", plan.Sets[0].Name)
		assert.Equal(t, int64(10), plan.Sets[0].Weight)
		assert.Equal(t, int64(20), plan.Sets[0].Reps)
		assert.Equal(t, "90/90 Hamstring", plan.Sets[1].Name)
		assert.Equal(t, int64(15), plan.Sets[1].Weight)
		assert.Equal(t, int64(25), plan.Sets[1].Reps)
	})
}
