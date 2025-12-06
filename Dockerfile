# Build stage
FROM golang:1.23-alpine AS builder

# Set Go Env
ENV CGO_ENABLED=0 GOOS=linux

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o main ./cmd/main.go

# Production stage
FROM alpine:latest

WORKDIR /root/

# Install specific certificates if needed (usually alpine has them, but good practice)
RUN apk --no-cache add ca-certificates

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Copy migration files if they are not embedded (assuming they are processing via code logic or embedded)
# If migrations are in a folder and needed at runtime, copy them. 
# Looking at main.go: migrations.RunMigrations(db) seems to be code-based.

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["./main"]
