package main

import (
	"encoding/json"
	"github.com/brayanMuniz/NihongoSync/db"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"io"
	"log"
	"net/http"
	"time"
)

type Config struct {
	WanikaniApiKey string `json:"wanikaniApiKey"`
}

type SummaryResponse struct {
	Object        string      `json:"object"`
	URL           string      `json:"url"`
	DataUpdatedAt time.Time   `json:"data_updated_at"`
	Data          SummaryData `json:"data"`
}

type SummaryData struct {
	Lessons       []Lesson   `json:"lessons"`
	NextReviewsAt *time.Time `json:"next_reviews_at"` // Use pointer to allow null values
	Reviews       []Review   `json:"reviews"`
}

type Lesson struct {
	AvailableAt time.Time `json:"available_at"`
	SubjectIDs  []int     `json:"subject_ids"`
}

type Review struct {
	AvailableAt time.Time `json:"available_at"`
	SubjectIDs  []int     `json:"subject_ids"`
}

func main() {

	log.Println("Starting db connection...")
	dbCon, err := db.ConnectDB() // Using the ConnectDB function from the db package
	if err != nil {
		log.Println("Error connecting to the database:", err)
		return
	}
	defer dbCon.Close()

	log.Println("Successfully connected to the database")

	r := gin.Default()

	// ! CURRENTLY INVALID
	// https://api.wanikani.com/v2/summary
	r.GET("/reviews/today", func(ctx *gin.Context) {
		apiToken := "change to get from database"
		url := "https://api.wanikani.com/v2/summary"

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Fatal("Failed to create request")
		}

		req.Header.Set("Authorization", "Bearer "+apiToken)

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Fatalf("Failed to send request: %v", err)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Failed to read response body: %v", err)
		}

		var todaySummary SummaryResponse
		if err := json.Unmarshal(body, &todaySummary); err != nil {
			log.Fatalf("Failed to unmarshal JSON: %v", err)
		}

		ctx.JSON(http.StatusOK, todaySummary)
	})

	r.POST("/createuser", func(ctx *gin.Context) {
		var user db.User
		if err := ctx.ShouldBindJSON(&user); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		user.Password = string(hashedPassword)
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		user.WanikaniSubscriptionActive = false // Default value

		// Save the user to the database
		if err := db.SaveUser(dbCon, &user); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
	})

	r.Run() // listen and serve on 0.0.0.0:8080
}
