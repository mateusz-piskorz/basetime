#!/bin/bash

main() {
    ./scripts/setup/_partials/minio-setup-buckets.sh
    npx prisma migrate deploy
    npx ts-node ./scripts/setup/_partials/basetime-org-setup.ts
}

main "$@"