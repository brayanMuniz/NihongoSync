package main

import (
	"github.com/brayanMuniz/NihongoSync/cronjobs"
	"github.com/brayanMuniz/NihongoSync/db"
	"github.com/brayanMuniz/NihongoSync/security"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
)

func main() {

	// Connect to database
	log.Println("Starting db connection...")
	dbCon, err := db.ConnectDB()
	if err != nil {
		log.Println("Error connecting to the database:", err)
		return
	}
	defer dbCon.Close()
	log.Println("Successfully connected to the database")

	// Get the passphrase to encrypt
	basePath, err := os.Getwd()
	if err != nil {
		log.Fatalf("Could not get working directory: %v", err)
	}
	secrets, err := security.LoadSecrets(basePath, "./secrets.json")
	if err != nil {
		log.Fatalf("failed to load secrets: %v", err)
	}
	encryptionKey := secrets.EncryptionKey

	// Initialize cron jobs
	cronjobs.InitCronJobs(encryptionKey)

	// Routes
	r := gin.Default()

	// Serve the frontend
	r.Use(static.Serve("/", static.LocalFile("../client/build", true)))

	r.POST("/createuser", func(ctx *gin.Context) {
		// Get the passphrase to encrypt
		basePath, err := os.Getwd()
		if err != nil {
			log.Fatalf("Could not get working directory: %v", err)
		}
		secrets, err := security.LoadSecrets(basePath, "./secrets.json")
		if err != nil {
			log.Fatalf("failed to load secrets: %v", err)
		}
		encryptionKey := secrets.EncryptionKey

		var user db.User

		// Bind json to data
		if err := ctx.ShouldBindJSON(&user); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Save the user to the database
		if err := db.SaveUser(dbCon, &user, encryptionKey); err != nil {
			log.Println("Failed to save user: ", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
	})

	r.Run() // listen and serve on 0.0.0.0:8080
}
