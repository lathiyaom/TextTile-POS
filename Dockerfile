# =============================================================================
# Multi-stage Dockerfile for Go Backend
# Industry Standard Best Practices:
# - Multi-stage build for smaller image size
# - Non-root user for security
# - Health checks
# - Proper layer caching
# - Security scanning friendly
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Stage
# -----------------------------------------------------------------------------
FROM golang:1.23-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Create non-root user for running the app
RUN adduser -D -g '' appuser

WORKDIR /build

# Copy go mod files first for better caching
COPY go.mod go.sum ./

# Download dependencies (cached if go.mod/go.sum unchanged)
RUN go mod download
RUN go mod verify

# Copy source code
COPY . .

# Build the application with optimizations
# -ldflags: reduce binary size and add version info
# -trimpath: remove file system paths from binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -trimpath \
    -o /build/app \
    ./cmd/main.go

# -----------------------------------------------------------------------------
# Stage 2: Production Stage
# -----------------------------------------------------------------------------
FROM alpine:3.19

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Import the user and group files from the builder
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Create necessary directories
RUN mkdir -p /app/logs && \
    chown -R appuser:appuser /app

WORKDIR /app

# Copy the binary from builder
COPY --from=builder --chown=appuser:appuser /build/app .

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
ENTRYPOINT ["./app"]
