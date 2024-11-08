package main

import (
	"github.com/brayanMuniz/NihongoSync/cronjobs"
	"github.com/brayanMuniz/NihongoSync/db"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
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

func JWTAuthMiddleware(jwtKey []byte) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Read the JWT from the Authorization header
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			ctx.Abort()
			return
		}

		const bearerPrefix = "Bearer "
		if len(authHeader) <= len(bearerPrefix) || authHeader[:len(bearerPrefix)] != bearerPrefix {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			ctx.Abort()
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
				ctx.Abort()
				return
			}

			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
			ctx.Abort()
			return
		}

		if !token.Valid {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			ctx.Abort()
			return
		}

		// Check if token is expired
		expirationTime := time.Unix(claims.ExpiresAt.Unix(), 0)
		if expirationTime.Sub(time.Now()) <= 0 {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Token expired"})
			ctx.Abort()
			return
		}

		// Set the claims in the context so that the handler can access it
		ctx.Set("claims", claims)
		ctx.Next()
	}
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

	// Load .env file
	godotenv.Load()

	// Access the passphrase
	encryptionKey := os.Getenv("PASSPHRASE")
	if encryptionKey == "" {
		log.Fatalf("PASSPHRASE not set in .env file")
	}

	// Initialize cron jobs
	cronjobs.InitCronJobs(encryptionKey)

	jwtKey = []byte(encryptionKey) // Set the JWT key

	// Routes
	r := gin.Default()

	// TODO: Configure
	// Enable CORS for all origins
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// NOTE: THIS IS SET UP FOR DOCKER
	// For local production use: ../client/build
	// Serve the frontend
	r.Use(static.Serve("/", static.LocalFile("./client/build", true)))

	r.POST("/createuser", func(ctx *gin.Context) {
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

		// Generate a JWT token for the newly created user
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

		// Return the signed JWT along with the success message
		ctx.JSON(http.StatusOK, gin.H{
			"message": "User created successfully",
			"token":   tokenString,
		})

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

	r.GET("/userWanikaniReviews", JWTAuthMiddleware(jwtKey), func(ctx *gin.Context) {

		// Retrieve the claims from the context
		claims, _ := ctx.Get("claims")
		userClaims := claims.(*Claims)

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

		user_id := userClaims.UserID

		reviews, err := db.GetWanikaniReviews(dbCon, user_id, start, end)
		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Could not find data"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"data": reviews})
	})

	r.Run(":3000")
}
