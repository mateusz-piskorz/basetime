#!/bin/bash

main() {
    ./scripts/setup/_partials/minio-setup-buckets.sh
    npx prisma migrate deploy
    npx ts-node ./scripts/setup/_partials/basetime-org-setup.ts
    npx ts-node ./scripts/setup/_partials/admin-user-setup.ts
}

main "$@"