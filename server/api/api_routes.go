package api

import (
	"database/sql"
	"log"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"iron.advaita.co/server/internal/models"
)

type ExerciseParams struct {
	name string
}

type ExerciseResponse struct {
	Id               string   `json:"id"`
	Name             string   `json:"name"`
	PrimaryMuscles   []string `json:"primary_muscles"`
	SecondaryMuscles []string `json:"secondary_muscles"`
	Force            string   `json:"force"`
	Level            string   `json:"level"`
	Mechanic         string   `json:"mechanic"`
	Equipment        string   `json:"equipment"`
	Category         string   `json:"category"`
	Description      string   `json:"description"`
}

func ExerciseApi(c *gin.Context) {
	name, _ := c.GetQuery("name")
	limitStr, ok := c.GetQuery("limit")
	var limit int
	if !ok {
		val, err := strconv.Atoi(limitStr)
		if err != nil {
			limit = 10
		} else {
			limit = val
		}
	} else {
		limit = 10
	}
	offsetStr, ok := c.GetQuery("offset")
	var offset int
	if !ok {
		val, err := strconv.Atoi(offsetStr)
		if err != nil {
			offset = 0
		} else {
			offset = val
		}
	} else {
		offset = 0
	}

	exercises, err := models.FilterExercises("%"+name+"%", limit, offset)
	if err != nil {
		log.Printf("got exercise error %v", err)
		c.JSON(500, gin.H{
			"message": err.Error(),
		})
		return
	}
	var responses []ExerciseResponse
	for _, exercise := range exercises {
		responses = append(responses, ExerciseResponse{
			Id:               exercise.Id,
			Name:             exercise.Name,
			PrimaryMuscles:   models.GetArrayFromPgArray(exercise.PrimaryMuscles),
			SecondaryMuscles: models.GetArrayFromPgArray(exercise.SecondaryMuscles),
			Force:            models.GetStringFromNullString(exercise.Force),
			Level:            exercise.Level,
			Mechanic:         models.GetStringFromNullString(exercise.Mechanic),
			Equipment:        models.GetStringFromNullString(exercise.Equipment),
			Category:         exercise.Category,
			Description:      models.GetStringFromNullString(exercise.Description),
		})
	}
	c.JSON(200, responses)
}

type CreatePlanParams struct {
	Name      string   `json:"name"`
	Exercises []string `json:"exercises"`
}

func CreatePlan(c *gin.Context) {
	var data CreatePlanParams
	bind_err := c.BindJSON(&data)
	if bind_err != nil {
		log.Printf("Got error while binding %s", bind_err.Error())
	}
	user_id, ok := c.Get("user_id")
	if !ok {
		c.JSON(403, gin.H{
			"message": "Invalid auth token",
		})
		return
	}

	err := models.CreatePlan(data.Name, data.Exercises, user_id.(int64))
	if err != nil {
		c.JSON(500, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{})
}

func FetchPlans(c *gin.Context) {
	user_id, ok := c.Get("user_id")
	if !ok {
		c.JSON(403, gin.H{
			"message": "Invalid auth token",
		})
		return
	}
	plans, err := models.FetchPlansOfUser(user_id.(int64))
	if err != nil {
		c.JSON(500, gin.H{
			"message": err.Error(),
		})
	}
	c.JSON(200, plans)
}

type WorkoutSetParams struct {
	ExerciseId string `json:"exercise_id"`
	Weights    int64  `json:"weights"`
	Reps       int64  `json:"reps"`
}

type CreateWorkoutParams struct {
	PlanId int64              `json:"plan_id"`
	Sets   []models.SetParams `json:"sets"`
}

func CreateWorkout(c *gin.Context) {
	var data CreateWorkoutParams
	bind_err := c.BindJSON(&data)
	if bind_err != nil {
		log.Printf("Got error while binding %s", bind_err.Error())
		c.JSON(400, gin.H{
			"message": bind_err.Error(),
		})
	}
	user_id, ok := c.Get("user_id")
	if !ok {
		c.JSON(403, gin.H{
			"message": "Invalid auth token",
		})
		return
	}

	plan_id := sql.NullInt64{
		Valid: false,
	}
	if data.PlanId != -1 {
		plan_id = sql.NullInt64{
			Int64: data.PlanId,
			Valid: true,
		}
	}
	err := models.CreateWorkout(data.Sets, user_id.(int64), plan_id)
	if err != nil {
		log.Printf("got workout error %s", err.Error())
		c.JSON(500, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{})
}

func FetchWorkouts(c *gin.Context) {
	user_id, ok := c.Get("user_id")
	if !ok {
		c.JSON(403, gin.H{
			"message": "Invalid auth token",
		})
		return
	}
	workouts, err := models.FetchWorkoutsOfUser(user_id.(int64), 20, 0)
	if err != nil {
		c.JSON(500, gin.H{
			"message": err.Error(),
		})
	}
	c.JSON(200, workouts)
}

func TokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Request.Header.Get("Authorization")
		parsed, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("SECRET")), nil
		})
		if err != nil {
			log.Printf("Error while reading auth token %v", err)
		} else {
			claims, ok := parsed.Claims.(jwt.MapClaims)
			if ok {
				user_id := int64(claims["sub"].(float64))
				c.Set("user_id", user_id)
			}
		}
		c.Next()
	}
}

func LoadApiRoutes(r *gin.Engine) {
	r.Use(TokenMiddleware())
	r.GET("/exercises", ExerciseApi)
	r.POST("/plans", CreatePlan)
	r.GET("/plans", FetchPlans)
	r.POST("/workouts", CreateWorkout)
	r.GET("/workouts", FetchWorkouts)
}
