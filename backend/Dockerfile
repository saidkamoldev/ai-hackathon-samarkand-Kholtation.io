# Go backend Dockerfile
FROM golang:1.21-alpine AS builder

# Kerakli paketlarni o'rnatish
RUN apk add --no-cache git ca-certificates tzdata

# Ish papkasini belgilash
WORKDIR /app

# Go mod fayllarini nusxalash
COPY go.mod go.sum ./

# Bog'liqliklarni yuklab olish
RUN go mod download

# Kodni nusxalash
COPY . .

# Binary faylni yaratish
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd

# Final image
FROM alpine:latest

# Kerakli paketlarni o'rnatish
RUN apk --no-cache add ca-certificates tzdata

# Ish papkasini belgilash
WORKDIR /root/

# Binary faylni nusxalash
COPY --from=builder /app/main .

# Port ochish
EXPOSE 8080

# Dasturni ishga tushirish
CMD ["./main"] 