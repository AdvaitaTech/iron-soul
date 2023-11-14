package tests

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"iron.advaita.co/server/api"
)

type RegisterResponse struct {
	Token string `json:"token"`
}

func CallRegisterApi(r *gin.Engine, email string, password string) RegisterResponse {
	w := httptest.NewRecorder()
	form := url.Values{
		"email":    {email},
		"password": {password},
		"confirm":  {password},
	}
	req, _ := http.NewRequest("POST", "/auth/register", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	r.ServeHTTP(w, req)
	buf := new(bytes.Buffer)
	buf.ReadFrom(w.Body)
	log.Printf("got auth response %s", buf)
	var result RegisterResponse
	json.Unmarshal(buf.Bytes(), &result)
	return result
}

func TestAuthApi(t *testing.T) {
	api.LoadEnv()
	r := api.SetupRouter()

	t.Run("should register user", func(t *testing.T) {
		w := httptest.NewRecorder()
		form := url.Values{
			"email":    {"testing200@example.com"},
			"password": {"testing@123"},
			"confirm":  {"testing@123"},
		}
		req, _ := http.NewRequest("POST", "/auth/register", strings.NewReader(form.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		r.ServeHTTP(w, req)
		buf := new(bytes.Buffer)
		buf.ReadFrom(w.Body)
		log.Printf("got auth response %s", buf)
		var result RegisterResponse
		json.Unmarshal(buf.Bytes(), &result)
		assert.Equal(t, 200, w.Code)
		assert.Contains(t, result.Token, "ey")
	})
	t.Run("should throw error on duplicate user", func(t *testing.T) {
		w := httptest.NewRecorder()
		form := url.Values{
			"email":    {"testing200@example.com"},
			"password": {"testing@123"},
			"confirm":  {"testing@123"},
		}
		req, _ := http.NewRequest("POST", "/auth/register", strings.NewReader(form.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		r.ServeHTTP(w, req)
		assert.Equal(t, 403, w.Code)
	})
	t.Run("should throw error on wrong confirm values", func(t *testing.T) {
		w := httptest.NewRecorder()
		form := url.Values{
			"email":    {"testing200@example.com"},
			"password": {"testing@123"},
			"confirm":  {"fail"},
		}
		req, _ := http.NewRequest("POST", "/auth/register", strings.NewReader(form.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		r.ServeHTTP(w, req)
		assert.Equal(t, 400, w.Code)
	})

	t.Run("should login user", func(t *testing.T) {
		w := httptest.NewRecorder()
		form := url.Values{
			"email":    {"testing200@example.com"},
			"password": {"testing@123"},
		}
		req, _ := http.NewRequest("POST", "/auth/login", strings.NewReader(form.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		r.ServeHTTP(w, req)
		buf := new(bytes.Buffer)
		buf.ReadFrom(w.Body)
		log.Printf("got auth response %s", buf)
		var result RegisterResponse
		json.Unmarshal(buf.Bytes(), &result)
		assert.Equal(t, 200, w.Code)
		assert.Contains(t, result.Token, "ey")
	})
	t.Run("should throw error on invalid credentials", func(t *testing.T) {
		w := httptest.NewRecorder()
		form := url.Values{
			"email":    {"testing200@example.com"},
			"password": {"fail"},
		}
		req, _ := http.NewRequest("POST", "/auth/login", strings.NewReader(form.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		r.ServeHTTP(w, req)
		assert.Equal(t, 401, w.Code)
	})
}
