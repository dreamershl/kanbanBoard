#!/usr/bin/env bash

set -eo pipefail

# This script runs the NPM audit command through the `audit-ci` for every folder containing NPM
# dependencies (the top level dir, `common` and `service-*`)
#
# The `audit-ci` module is executed via NPX, hence this script does not need the NPM deps. to be
# installed beforehand (thus it can detect vulnerabilities before the vulnerable code is downloaded)

CONFIG="audit-ci.json"

SCRIPTS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT="$( cd "$SCRIPTS/.." >/dev/null 2>&1 && pwd )"

cd "$ROOT"

npm install --no-package-lock --no-save audit-ci

FOUND_BUG=0

PROMPT="dependencies vulnerabilities";
echo -ne "$PROMPT: ⏳ checking"

if ! RESULT=$(./node_modules/.bin/audit-ci --config "$CONFIG" -d "$ROOT"); then
    echo -e "\r$PROMPT: 🐞 found \n$RESULT"
    FOUND_BUG=1
else
    echo -e "\r$PROMPT: ✔ No vulnerabilities"
fi

exit $FOUND_BUG
