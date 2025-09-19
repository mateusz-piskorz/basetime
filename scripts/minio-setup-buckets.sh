#!/bin/sh

/usr/bin/mc alias set minioalias http://minio:9000 ${ACCESS_KEY} ${SECRET_KEY}
/usr/bin/mc mb --ignore-existing minioalias/useravatar

exit 0;
