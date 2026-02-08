FROM node:24-alpine

RUN apk add --no-cache curl \
    && curl -L https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/bin/mc \
    && chmod +x /usr/bin/mc

WORKDIR /app

COPY . .

EXPOSE 3000