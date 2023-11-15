package api

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"iron.advaita.co/server/internal/models"
)

type RegisterForm struct {
	Email    string `form:"email"`
	Password string `form:"password"`
	Confirm  string `form:"confirm"`
}

type LoginForm struct {
	Email    string `form:"email"`
	Password string `form:"password"`
}

func RegisterApi(c *gin.Context) {
	var data RegisterForm
	c.Bind(&data)

	log.Printf("got register %#v", data)
	user, err := models.CreateUser(data.Email, data.Password)
	if data.Password != data.Confirm {
		c.JSON(400, gin.H{
			"message": "password and confirmation values do not match",
		})
	}
	if err != nil {
		c.JSON(403, gin.H{
			"message": err.Error(),
		})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.Id,
	})
	secret := os.Getenv("SECRET")
	s, e2 := token.SignedString([]byte(secret))
	if e2 != nil {
		c.JSON(500, gin.H{
			"message": e2,
		})
		return
	}
	c.JSON(200, gin.H{
		"token": s,
	})
}

func LoginApi(c *gin.Context) {
	var data LoginForm
	c.Bind(&data)

	user, err := models.FetchUserWithCredentials(data.Email, data.Password)
	if err != nil {
		c.JSON(401, gin.H{
			"message": err.Error(),
		})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.Id,
	})
	secret := os.Getenv("SECRET")
	s, e2 := token.SignedString([]byte(secret))
	if e2 != nil {
		c.JSON(500, gin.H{
			"message": e2,
		})
		return
	}
	c.JSON(200, gin.H{
		"token": s,
	})
}

func LoadAuthRoutes(r *gin.Engine) {
	r.POST("/auth/register", RegisterApi)
	r.POST("/auth/login", LoginApi)
}
