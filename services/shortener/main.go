package main

import (
	"github.com/gofiber/fiber/v3"
)

func main() {
	app := fiber.New()

	// Main API endpoint
	app.Post("/shorten", func(c fiber.Ctx) error {
		return c.SendString("ok")
	})

	// Health check endpoint for Kubernetes probes
	app.Get("/health", func(c fiber.Ctx) error {
		return c.SendString("healthy")
	})

	app.Listen(":8080")
}
