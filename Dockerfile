FROM node:24-alpine

COPY --from=minio/mc:latest /usr/bin/mc /usr/bin/mc

WORKDIR /app