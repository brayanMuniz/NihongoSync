package main

import (
	"encoding/json"
	"github.com/brayanMuniz/NihongoSync/db"
	"github.com/gin-gonic/gin"
	"io"
	"log"
	"net/http"
	"os"
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

	// Read Json File
	data, err := os.ReadFile("./secrets.json")
	if err != nil {
		log.Fatal("API KEYS NOT FOUND")
	}

	// Unmarshal the JSON data into the struct
	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		log.Fatalf("Failed to unmarshal JSON: %v", err)
	}

	// log.Println(config.WanikaniApiKey)
	log.Print("TEST")

	log.Println("Starting db connection...")
	db, err := db.ConnectDB() // Using the ConnectDB function from the db package
	if err != nil {
		log.Println("Error connecting to the database:", err)
		return
	}
	defer db.Close()

	log.Println("Successfully connected to the database")

	r := gin.Default()

	// https://api.wanikani.com/v2/summary
	r.GET("/reviews/today", func(ctx *gin.Context) {
		apiToken := config.WanikaniApiKey
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

	r.Run() // listen and serve on 0.0.0.0:8080
}
