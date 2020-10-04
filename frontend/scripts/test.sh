#!/usr/bin/env bash

# This is a helper script for running the unit tests in the project. It aims in making it easier to
# address different test scenarios (e.g. a specific file, or a specific service, or everything).
#
# This flexibility allows it to be used in IDEs in simple task definitions, allowing developers,
# for example, to run tests only for the file they are currently working on.

# Disable logger output when running the tests (does NOT disable `console.log()`)
export DISABLE_LOG_OUTPUT="${DISABLE_LOG_OUTPUT:-1}"

FILE=$1

if [[ "$FILE" == "-h" || "$FILE" == "--help" ]]; then
    echo "
    Runs the project's unit tests.

    Usage:
    npm run test
    Without arguments, runs all tests in the project.

    npm run test -- <pathToFile>
    Runs all tests related to the given file. If the file is a test file, it is executed. If the path
    is a regular source code file, it will look for its test file and run the tests in it. Note that
    it assumes tests are in '*.unitTtest.pem' files located next to the original source file being tested.

    npm run test -- <pathToFolder>
    Runs all test found in a folder and subfolders.
    Example: 'npm run test -- ./common' will run all tests for our shared utilities.

    npm run test -- --help
    Shows usage instructions.
    "

    exit 0
fi

SCRIPTS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT="$( cd "$SCRIPTS/.." >/dev/null 2>&1 && pwd )"
ROOT_SRC="$ROOT/src"

# This would not be necessary if the script would always be executed via 'npm', but is necessary to
# get it working as a stand-alone script
BIN="$ROOT/node_modules/.bin"

if [[ -z "$FILE" ]]; then
    FILE=""
elif [[ ! -d "$FILE" ]]; then
    if [[ -d "$ROOT_SRC/$FILE" ]]; then
        FILE="$ROOT_SRC/$FILE"
    else
        if [[ "$FILE" =~ \.[tj]sx?$ && ! "$FILE" =~ \.test\.[tj]sx?$ ]]; then
            # If the path points to a non-test file, try to get its test file
            # shellcheck disable=SC2001
            FILE="$(echo "$FILE" | sed "s/\.[tj]sx*$/.test&/")"
        fi
    fi

    if [[ ! -e "$FILE" ]]; then
        echo "no tests found for: $FILE"
        exit 1
    fi
fi

if [[ -z "$CI" ]]; then
    if [[ -z "$DEBUG" ]]; then
    "$BIN/jest" --config "$ROOT/jest.config.json" --no-cache "$FILE"
  else
    node --inspect-brk "$BIN/jest" --runInBand --config "$ROOT/jest.config.json" --no-cache "$FILE"
  fi
else
    "$BIN/jest" --config "$ROOT/jest.config.json" --reporters=jest-silent-reporter --reporters=jest-junit --ci "$FILE"
fi

exit $?
