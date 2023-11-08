package main

import (
	"os"
	"testing"
)

func TestMain(m *testing.M) {
	loadEnv()
	code := m.Run()
	os.Exit(code)
}
