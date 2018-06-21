#!/bin/sh

case $1 in
  "run")
    shift
    /app/docker/run.sh
    ;;
  "migrate")
    shift
    /app/docker/migrate.sh
    ;;
  *)
    echo "usage: $0 [build|run|migrate]"
    exit 1
    ;;
esac