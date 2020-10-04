#!/usr/bin/env bash

MODULE="kanbanweb"

PORT=$1

if [[ -z $PORT ]]; then
  echo "port isn't specified. using the default value 8080"
  PORT=8080
fi

SCRIPTS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
JS_PATH=$( cd "$SCRIPTS/../frontend/" >/dev/null 2>&1 && pwd )

if [[ -z $JS_PATH ]]; then
  echo "can't find $MODULE folder"
  exit 1;
fi

VERSION=$(node -e "console.log(require(\"${JS_PATH}/package.json\").version);")

rm -rf "$JS_PATH/build"
rm -rf "$JS_PATH/node_modules"
rm -rf "$JS_PATH/coverage"

docker build --build-arg PORT=$PORT \
      -f "$SCRIPTS/web.Dockerfile" \
      -t "$MODULE:$VERSION" \
      -t "${MODULE}:latest" \
      "$JS_PATH"