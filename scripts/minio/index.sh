#!/bin/bash

main() {
    ./scripts/minio/_partials/minio-setup-buckets.sh
}

main "$@"