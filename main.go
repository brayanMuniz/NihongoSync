package main

import (
	"github.com/brayanMuniz/NihongoSync/cronjobs"
	"github.com/brayanMuniz/NihongoSync/db"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
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

	// Initialize cron jobs
	cronjobs.InitCronJobs()

	r := gin.Default()

	r.POST("/createuser", func(ctx *gin.Context) {
		var user db.User

		// Bind json to data
		if err := ctx.ShouldBindJSON(&user); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Save the user to the database
		if err := db.SaveUser(dbCon, &user); err != nil {
			log.Println("Failed to save user: ", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
	})

	r.Run() // listen and serve on 0.0.0.0:8080
}
