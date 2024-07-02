package db

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
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
}

func ConnectDB() (*sql.DB, error) {
	connStr := "user=brayanmuniz dbname=nihongosync sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %v", err)
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to the database: %v", err)
	}
	return db, nil
}

func SaveUser(db *sql.DB, user *User) error {
	query := `INSERT INTO users (username, email, password, wanikani_api_key, wanikani_subscription_active, created_at, updated_at)
	          VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := db.Exec(query, user.Username, user.Email, user.Password, user.WanikaniApiKey, user.WanikaniSubscriptionActive, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return fmt.Errorf("error saving user to the database: %v", err)
	}
	return nil
}
