FROM golang:1.24 as build
WORKDIR /app
COPY . .
RUN go build -o shortener .

FROM gcr.io/distroless/base
COPY --from=build /app/shortener /
ENTRYPOINT ["/shortener"]
