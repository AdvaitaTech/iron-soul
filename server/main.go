package main

import (
	"os"

	"iron.advaita.co/server/api"
)

func main() {
	api.LoadEnv()
	r := api.SetupRouter()
	r.Run(":" + os.Getenv("PORT"))
}
