FROM rust:1.82 as builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# First copy only Cargo.toml and src
COPY Cargo.toml ./
COPY src ./src

# Build the application
RUN cargo build --release

# Create a smaller final image that includes the required GLIBC version
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /usr/src/app/target/release/echo-ws /app/echo-ws

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8080
ENV RUST_LOG=info

# Expose the port
EXPOSE 8080

# Run the binary
CMD ["./echo-ws"]
