package cronjobs

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/brayanMuniz/NihongoSync/db"
	"github.com/brayanMuniz/NihongoSync/security"
	_ "github.com/lib/pq"
	"github.com/robfig/cron/v3"
)

type SummaryResponse struct {
	Object        string      `json:"object"`
	URL           string      `json:"url"`
	DataUpdatedAt time.Time   `json:"data_updated_at"`
	Data          SummaryData `json:"data"`
}

type SummaryData struct {
	Lessons       []Lesson   `json:"lessons"`
	NextReviewsAt *time.Time `json:"next_reviews_at"` // pointer to allow null values
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

func fetchAndStoreReviews(encryptionKey string) {
	log.Println("Running fetchAndStoreReviews job...")

	// Connect to Database
	dbCon, err := db.ConnectDB()
	if err != nil {
		log.Println("Error connecting to the database:", err)
		return
	}
	defer dbCon.Close()

	// Run the Query to fetch users where review hour is the current hour
	var users []db.User
	currentTimeStr := fmt.Sprintf("%02d:00:00", time.Now().Hour()) // Convert hour to "HH:00:00" format
	log.Println("Current hour string:", currentTimeStr)

	query := "SELECT id, wanikani_api_key, review_start_time FROM users WHERE review_start_time = $1"
	err = dbCon.Select(&users, query, currentTimeStr)
	if err != nil {
		log.Println("Error fetching users:", err)
		return
	}

	for _, user := range users {
		// Decrypt the api key
		decryptedApiKey, err := security.Decrypt(user.WanikaniApiKey, encryptionKey)
		if err != nil {
			log.Println("Error decrypting API key:", err)
			continue
		}

		// Format and send get request
		url := "https://api.wanikani.com/v2/summary"
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Println("Failed to create request:", err)
			continue
		}

		req.Header.Set("Authorization", "Bearer "+decryptedApiKey)

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Println("Failed to send request:", err)
			continue
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Println("Failed to read response body:", err)
			continue
		}

		var summaryResponse SummaryResponse
		if err := json.Unmarshal(body, &summaryResponse); err != nil {
			log.Println("Failed to unmarshal JSON:", err)
			continue
		}

		// Gets the reviews due now and in 24 hours
		dueIn24Hours := 0
		dueNow := len(summaryResponse.Data.Reviews[0].SubjectIDs)
		for _, review := range summaryResponse.Data.Reviews {
			dueIn24Hours += len(review.SubjectIDs)
		}

		query := `INSERT INTO wanikanireviews (user_id, review_date, due_now, due_in_24_hours, review_time)
	          VALUES ($1, $2, $3, $4, $5)`
		_, err = dbCon.Exec(query, user.ID, time.Now(), dueNow, dueIn24Hours, currentTimeStr)

		if err != nil {
			log.Printf("Error saving user %d data to the database: %v", user.ID, err)
			continue
		}

		log.Printf("User %d: dueNow=%d, dueIn24Hours=%d, inserted into wanikanireviews", user.ID, dueNow, dueIn24Hours)

	}
}

func InitCronJobs(encryptionKey string) {
	log.Println("Starting Cron Jobs")
	c := cron.New()
	c.AddFunc("@hourly", func() {
		fetchAndStoreReviews(encryptionKey)
	})
	c.Start()
}
