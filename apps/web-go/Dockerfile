# Use a smaller base image for a leaner final image
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum* ./
# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code
COPY . .

# Build the Go app
# CGO_ENABLED=0 for static linking, GOOS=linux for cross-compilation if needed
# -ldflags "-w -s" to strip debug information and reduce binary size
RUN CGO_ENABLED=0 GOOS=linux go build -a -ldflags "-w -s" -o web-go main.go

# --- Second stage: Create the final image ---
FROM alpine:latest

WORKDIR /app

# Copy the pre-built binary from the builder stage
COPY --from=builder /app/web-go .

# Expose port 8080 
EXPOSE 8080

# Set the PORT environment variable (optional, as the app defaults to 8080)
ENV PORT=8080

# Command to run the executable
CMD ["./web-go"]
