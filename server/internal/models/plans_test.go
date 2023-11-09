package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPlansModel(t *testing.T) {
	t.Run("should create a plan", func(t *testing.T) {
		user, _ := CreateUser("testing5@example.com", "testing@123")
		err := CreatePlan("Chest Day", []string{"b1345a14-a309-43ac-b9de-aef5120f04b2", "027fb70a-e288-4cf3-b6c1-8e05da0eb984"}, user.Id)
		assert.Equal(t, err, nil)
	})

	t.Run("should fetch plans of user", func(t *testing.T) {
		user, _ := CreateUser("testing6@example.com", "testing@123")
		CreatePlan("Chest Day", []string{"b1345a14-a309-43ac-b9de-aef5120f04b2", "027fb70a-e288-4cf3-b6c1-8e05da0eb984"}, user.Id)
		plans, err := FetchPlansOfUser(user.Id)
		assert.Equal(t, err, nil)
		assert.Equal(t, plans[0].Name, "Chest Day")
		assert.Equal(t, "3/4 Sit-Up", plans[0].Exercises[0].Name)
		assert.Equal(t, "90/90 Hamstring", plans[0].Exercises[1].Name)
	})
}
