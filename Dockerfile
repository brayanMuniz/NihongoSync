# Build React app
FROM node:18 AS client-builder

WORKDIR /client

# Install dependencies
COPY client/package*.json ./
RUN npm install

# Copy the rest of the client source code and build it
COPY client/ ./
RUN npm run build

# Build Go server
FROM golang:1.22.3 AS server-builder

WORKDIR /app

# Install air for live reload
# RUN go install github.com/air-verse/air@latest

# Copy the Go server's module files
COPY server/go.mod server/go.sum ./
RUN go mod download
RUN go mod tidy

# Copy the Go server source code
COPY server/ ./
COPY .env ./

# Copy the React build files into the server directory (to serve them)
COPY --from=client-builder /client/build ./client/build

# Development command to start the Go server with air (for live reload)
# CMD ["air"]

# Build the Go server
RUN go build -o main main.go

# Run the Go server
FROM golang:1.22.3

WORKDIR /app

# Copy the built server from the previous stage
COPY --from=server-builder /app/main .
COPY --from=server-builder /app/client/build ./client/build

# Expose port 3000 to the outside world
EXPOSE 3000

# Run the Go server
CMD ["./main"]
