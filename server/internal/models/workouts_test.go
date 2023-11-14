package models

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkoutsModel(t *testing.T) {
	t.Run("should create a workout with nil plan", func(t *testing.T) {
		var params = []SetParams{
			{
				ExerciseId: "b1345a14-a309-43ac-b9de-aef5120f04b2",
				Weight:     40,
				Reps:       5,
			},
			{
				ExerciseId: "027fb70a-e288-4cf3-b6c1-8e05da0eb984",
				Weight:     30,
				Reps:       10,
			},
		}
		user, _ := CreateUser("testing10@example.com", "testing@123")
		err := CreateWorkout(params, user.Id, sql.NullInt64{})
		workouts, err := FetchWorkoutsOfUser(user.Id, 10, 0)
		assert.Equal(t, err, nil)
		for _, workout := range workouts {
			assert.Equal(t, "3/4 Sit-Up", workout.Sets[0].Name)
			assert.Equal(t, "90/90 Hamstring", workout.Sets[1].Name)
			for i, set := range workout.Sets {
				assert.Equal(t, params[i].Weight, set.Weight)
				assert.Equal(t, params[i].Reps, set.Reps)
			}
		}
	})

	t.Run("should create a workout from a normal plan", func(t *testing.T) {
		var params = []SetParams{
			{
				ExerciseId: "b1345a14-a309-43ac-b9de-aef5120f04b2",
				Weight:     40,
				Reps:       5,
			},
			{
				ExerciseId: "027fb70a-e288-4cf3-b6c1-8e05da0eb984",
				Weight:     30,
				Reps:       10,
			},
		}
		user, _ := CreateUser("testing11@example.com", "testing@123")
		CreatePlan("Chest Day", []string{"b1345a14-a309-43ac-b9de-aef5120f04b2", "027fb70a-e288-4cf3-b6c1-8e05da0eb984"}, user.Id)
		plans, _ := FetchPlansOfUser(user.Id)
		err := CreateWorkout(params, user.Id, sql.NullInt64{
			Int64: plans[0].Id,
			Valid: true,
		})

		workouts, err := FetchWorkoutsOfUser(user.Id, 10, 0)
		assert.Equal(t, err, nil)
		for _, workout := range workouts {
			assert.Equal(t, plans[0].Id, workout.PlanId.Int64)
			assert.Equal(t, "3/4 Sit-Up", workout.Sets[0].Name)
			assert.Equal(t, "90/90 Hamstring", workout.Sets[1].Name)
			for i, set := range workout.Sets {
				assert.Equal(t, params[i].Weight, set.Weight)
				assert.Equal(t, params[i].Reps, set.Reps)
			}
		}
	})
}
