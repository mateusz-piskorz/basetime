#!/bin/sh

/usr/bin/mc alias set minioalias http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
/usr/bin/mc mb --ignore-existing minioalias/main
/usr/bin/mc mb --ignore-existing minioalias/public
/usr/bin/mc anonymous set download minioalias/public
/usr/bin/mc admin user add minioalias ${MINIO_USER} ${MINIO_PASSWORD}
/usr/bin/mc admin policy attach minioalias readwrite --user ${MINIO_USER}

exit 0;
