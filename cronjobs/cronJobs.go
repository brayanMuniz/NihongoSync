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

func TestFetchAndStore(encryptionKey string) (map[int]int, error) {
	dbCon, err := db.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("error connecting to the database: %v", err)
	}
	defer dbCon.Close()

	var users []db.User

	query := "SELECT * FROM users"
	err = dbCon.Select(&users, query)
	if err != nil {
		return nil, fmt.Errorf("error fetching users: %v", err)
	}

	log.Println(len(users))

	// Map to store user ID and the total count of reviews within the time range
	reviewsCount := make(map[int]int)

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

		// TODO: save to wanikanireviews based on this
		// id | user_id | review_date | due_now | due_in_24_hours
		// Store the total count of reviews for the user
		query := `INSERT INTO wanikanireviews (user_id, review_date, due_now, due_in_24_hours)
	          VALUES ($1, $2, $3, $4)`
		_, err = dbCon.Exec(query, user.ID, time.Now(), dueNow, dueIn24Hours)

		if err != nil {
			log.Printf("Error saving user %d data to the database: %v", user.ID, err)
			continue
		}

		reviewsCount[user.ID] = dueIn24Hours
	}

	return reviewsCount, nil
}

// TestFetchAndStore fetches review data and returns it
func fetchAndStoreReviews() {
	log.Println("Running fetchAndStoreReviews job...")

	dbCon, err := db.ConnectDB()
	if err != nil {
		log.Println("Error connecting to the database:", err)
		return
	}
	defer dbCon.Close()

	currentHour := time.Now().Hour()
	var users []db.User

	query := "SELECT id, wanikani_api_key, first_review_session FROM users WHERE first_review_session = $1 OR first_review_session = $2"
	err = dbCon.Select(&users, query, currentHour, (currentHour+12)%24)
	if err != nil {
		log.Println("Error fetching users:", err)
		return
	}

	for _, user := range users {
		// Decrypt the api key
		decryptedApiKey, err := security.Decrypt(user.WanikaniApiKey, "your-encryption-key")
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

		log.Println(summaryResponse)

	}
}

func InitCronJobs() {
	log.Println("Starting Cron Jobs")
	c := cron.New()
	c.AddFunc("@hourly", fetchAndStoreReviews)
	c.Start()
}
