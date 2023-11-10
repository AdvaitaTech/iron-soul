package main

import (
	"iron.advaita.co/server/api"
)

func main() {
	api.LoadEnv()
	r := api.SetupRouter()
	r.Run()
}
