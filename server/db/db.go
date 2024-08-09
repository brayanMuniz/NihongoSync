package db

import (
	"fmt"
	"github.com/brayanMuniz/NihongoSync/security"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"log"
	"os"
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

type WanikaniReview struct {
	ID           int       `json:"id" db:"id"`
	UserID       int       `json:"user_id" db:"user_id"`
	ReviewDate   time.Time `json:"review_date" db:"review_date"`
	DueNow       int       `json:"due_now" db:"due_now"`
	DueIn24Hours int       `json:"due_in_24_hours" db:"due_in_24_hours"`
	ReviewTime   string    `json:"review_time" db:"review_time"`
}

func ConnectDB() (*sqlx.DB, error) {
	// Retrieve the environment variables
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")

	log.Println("DB Connection Details:", user, password, dbname, host, port)

	// If POSTGRES_HOST or POSTGRES_PORT are not set, use default values
	if host == "" {
		host = "localhost" // or "db" if using Docker Compose
	}
	if port == "" {
		port = "5432"
	}

	// Construct the connection string using environment variables
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	// Open the database connection
	db, err := sqlx.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %v", err)
	}

	// Test the connection
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

func GetWanikaniReviews(db *sqlx.DB, userID int, start_time, end_time time.Time) ([]WanikaniReview, error) {
	query := `
		SELECT id, user_id, review_date, due_now, due_in_24_hours, review_time
		FROM wanikanireviews
		WHERE user_id = $1 AND review_date BETWEEN $2 AND $3
		ORDER BY review_date ASC`

	log.Printf("Executing query: %s with user ID: %d, start time: %s, end time: %s\n", query, userID, start_time, end_time)
	rows, err := db.Queryx(query, userID, start_time, end_time)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []WanikaniReview
	for rows.Next() {
		var review WanikaniReview
		if err := rows.StructScan(&review); err != nil {
			return nil, err
		}
		reviews = append(reviews, review)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return reviews, nil
}

func AuthenticateUser(db *sqlx.DB, usernameOrEmail, password string) (*User, error) {
	var user User

	// Retrieve the user by username or email
	query := `SELECT * FROM users WHERE username = $1 OR email = $2`
	if err := db.Get(&user, query, usernameOrEmail, usernameOrEmail); err != nil {
		return nil, fmt.Errorf("error fetching user: %v", err)
	}

	// Compare the provided password with the stored hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid password: %v", err)
	}

	return &user, nil
}
