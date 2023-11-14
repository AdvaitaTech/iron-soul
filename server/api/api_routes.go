package api

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"iron.advaita.co/server/internal/models"
)

type ExerciseParams struct {
	name string
}

func ExerciseApi(c *gin.Context) {
	name, _ := c.GetQuery("name")

	exercises, err := models.FilterExercises("%"+name+"%", 50, 0)
	if err != nil {
		c.JSON(500, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(200, exercises)
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
}
