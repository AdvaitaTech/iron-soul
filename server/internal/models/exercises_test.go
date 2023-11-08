package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExercisesModel(t *testing.T) {
	t.Run("should filter some exercises", func(t *testing.T) {
		exercises, err := FilterExercises("%Bench Press%", 5, 0)
		assert.Equal(t, err, nil)
		for _, ex := range exercises {
			assert.Contains(t, ex.Name, "Bench Press")
		}
		next, errs := FilterExercises("%Bench Press%", 5, 5)
		assert.Equal(t, errs, nil)
		for _, ex := range next {
			for _, old := range exercises {
				assert.NotEqual(t, old.Id, ex.Id)
			}
		}
	})
}
