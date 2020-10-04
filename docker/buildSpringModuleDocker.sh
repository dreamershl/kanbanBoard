#!/usr/bin/env bash

MODULE="kanbanboard"
PORT=$1

if [[ -z $PORT ]]; then
  echo "port isn't specified. using the default value 8080"
  PORT=8080
fi

IP=$2

if [[ -z $IP ]]; then
  echo "service listen IP isn't specified. using the default value 0.0.0.0"
  IP="0.0.0.0"
fi


DEPLOY_FOLDER="/var/$MODULE"
SCRIPTS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

JAR_PATH=$( cd "$( dirname "$SCRIPTS/../backend/target/*.jar" )" >/dev/null 2>&1 && pwd )

if [[ -z $JAR_PATH ]]; then
  echo "can't find the mvn build output in $SCRIPTS/../backend/target. need build the project first"
  exit 1;
fi

TARGETS=$(ls "$JAR_PATH"/*.jar)
JAR_FILE=${TARGETS#$JAR_PATH}
VERSION=$(echo "$JAR_FILE" |  awk -F- '{print substr($NF,0,length($NF)-4)}')

echo "build jar docker image from path $JAR_PATH"

mkdir ".dockerbuild"
cp "$JAR_PATH"/*.jar ".dockerbuild"

docker build --build-arg PORT=$PORT \
      --build-arg IP=$IP \
      --build-arg DEPLOY_FOLDER="$DEPLOY_FOLDER" \
      --build-arg MODULE="$JAR_FILE" \
      -f "$SCRIPTS/springModule.Dockerfile" \
      -t "$MODULE:$VERSION" \
      -t "${MODULE}:latest" \
      ".dockerbuild"

rm -r ".dockerbuild"
