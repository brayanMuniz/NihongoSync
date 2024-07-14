package db

import (
	"fmt"
	"github.com/brayanMuniz/NihongoSync/security"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"log"
	"time"
)

// User represents a user in the database.
type User struct {
	ID                         int       `json:"id" db:"id"`
	Username                   string    `json:"username" db:"username" binding:"required"`
	Email                      string    `json:"email" db:"email" binding:"required"`
	Password                   string    `json:"password" db:"password" binding:"required"`
	WanikaniApiKey             string    `json:"wanikani_api_key" db:"wanikani_api_key"`
	WanikaniSubscriptionActive bool      `json:"wanikani_subscription_active" db:"wanikani_subscription_active"`
	CreatedAt                  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt                  time.Time `json:"updated_at" db:"updated_at"`
	ReviewStartTime            string    `json:"review_start_time" db:"review_start_time"` // Store as string to handle time type
}

func ConnectDB() (*sqlx.DB, error) {
	connStr := "user=brayanmuniz dbname=nihongosync sslmode=disable"
	db, err := sqlx.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %v", err)
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to the database: %v", err)
	}
	return db, nil
}

func SaveUser(db *sqlx.DB, user *User, encryptionKey string) error {
	// encrypt the wanikani api key
	encryptedApiKey, err := security.Encrypt(user.WanikaniApiKey, encryptionKey)
	if err != nil {
		log.Fatalf("error encrypting API key: %v", err)
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("error: Failed to hash password: %v", err)
	}

	// Set User data
	user.Password = string(hashedPassword)
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.WanikaniSubscriptionActive = false // Default value

	// Execute the query into the database
	query := `INSERT INTO users (username, email, password, wanikani_api_key, 
	wanikani_subscription_active, created_at, updated_at, review_start_time)
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err = db.Exec(query, user.Username, user.Email, user.Password, encryptedApiKey,
		user.WanikaniSubscriptionActive, user.CreatedAt, user.UpdatedAt, user.ReviewStartTime)

	if err != nil {
		return fmt.Errorf("error saving user to the database: %v", err)
	}

	return nil
}
