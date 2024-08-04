package main

import (
	"github.com/brayanMuniz/NihongoSync/cronjobs"
	"github.com/brayanMuniz/NihongoSync/db"
	"github.com/brayanMuniz/NihongoSync/security"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"log"
	"net/http"
	"os"
	"time"
)

type Claims struct {
	Username string `json:"username"`
	UserID   int    `json:"user_id"`
	jwt.RegisteredClaims
}

var jwtKey []byte

// getEncryptionKey loads the encryption key from the secrets file.
func getEncryptionKey() (string, error) {
	basePath, err := os.Getwd()
	if err != nil {
		return "", err
	}
	secrets, err := security.LoadSecrets(basePath, "./secrets.json")
	if err != nil {
		return "", err
	}
	return secrets.EncryptionKey, nil
}

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

	// Get the encryption key
	encryptionKey, err := getEncryptionKey()
	if err != nil {
		log.Fatalf("Failed to get encryption key: %v", err)
	}

	// Initialize cron jobs
	cronjobs.InitCronJobs(encryptionKey)

	jwtKey = []byte(encryptionKey) // Set the JWT key

	// Routes
	r := gin.Default()

	// Enable CORS for all origins
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Adjust this to your client URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Serve the frontend
	r.Use(static.Serve("/", static.LocalFile("../client/build", true)))

	r.POST("/createuser", func(ctx *gin.Context) {
		// Get the encryption key
		encryptionKey, err := getEncryptionKey()
		if err != nil {
			log.Fatalf("Failed to get encryption key: %v", err)
		}

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

	r.POST("/login", func(ctx *gin.Context) {

		// read user credentials, email and password
		var loginData struct {
			UsernameOrEmail string `json:"username_or_email" binding:"required"`
			Password        string `json:"password" binding:"required"`
		}

		if err := ctx.ShouldBindJSON(&loginData); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// get the password from the user in the database based on if they provided a username or email
		user, err := db.AuthenticateUser(dbCon, loginData.UsernameOrEmail, loginData.Password)
		if err != nil {
			log.Println("Failed to authenticate user: ", err)
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username/email or password"})
			return
		}

		// Return a signed JWT
		encryptionKey, err := getEncryptionKey()
		if err != nil {
			log.Fatalf("Failed to get encryption key: %v", err)
		}

		expirationTime := time.Now().Add(time.Hour * 24 * 30) // Token expiration time is 30 days
		claims := &Claims{
			Username: user.Username,
			UserID:   user.ID,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(expirationTime),
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		// Sign the token with the encryption key
		tokenString, err := token.SignedString([]byte(encryptionKey))
		if err != nil {
			log.Println("Failed to sign token: ", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		// Return the signed JWT
		ctx.JSON(http.StatusOK, gin.H{"message": "Login successful", "token": tokenString})
	})

	r.GET("/userWanikaniReviews", func(ctx *gin.Context) {

		// Read the JWT from the Authorization header
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			return
		}

		const bearerPrefix = "Bearer "
		if len(authHeader) <= len(bearerPrefix) || authHeader[:len(bearerPrefix)] != bearerPrefix {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			return
		}

		tokenString := authHeader[len(bearerPrefix):]

		// Parse and verify the JWT
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil {
			if err == jwt.ErrSignatureInvalid {
				ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token signature"})
				return
			}
			log.Println("here 1")

			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
			return
		}

		if !token.Valid {
			log.Println("here 2")
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Check if token is expired
		expirationTime := time.Unix(claims.ExpiresAt.Unix(), 0)

		if expirationTime.Sub(time.Now()) <= 0 {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Token expired"})
			return
		}

		// Use provided data to return the range of reviews done
		startDate := ctx.Query("start_date")
		endDate := ctx.Query("end_date")

		if startDate == "" || endDate == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Both start_date and end_date are required"})
			return
		}

		// Parse the dates
		timeFormat := "2006-01-02" // NOTE: this is needed to parese it as YEAR-MONTH-DAY
		start, err := time.Parse(timeFormat, startDate)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format"})
			return
		}
		end, err := time.Parse(timeFormat, endDate)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format"})
			return
		}

		if end.Before(start) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "end_date must be after start_date"})
			return
		}

		user_id := claims.UserID

		reviews, err := db.GetWanikaniReviews(dbCon, user_id, start, end)
		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Could not find data"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"data": reviews})

	})

	// Start the server on port 8080
	r.Run(":8080")
}
