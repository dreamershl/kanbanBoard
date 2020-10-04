#!/usr/bin/env bash

set -eo pipefail
# This helper runs checks the code styles in the project or in specific parts of the repository.

function usage {
    echo "
    Checks (or fixes) the code style and format in the repository's source code or in parts of it.

    Usage:
    npm run check:style
      Checks the code style and format for the whole repository.

    npm run check:style -- --fix
      Checks and **autofixes** the code style and format for the whole repository.

    npm run check:style -- <service>
      Checks the code style and format for a specific service.
      Example: npm run check:style -- twitter

    npm run check:style -- --fix <service>
      Checks and **autofixes** the code style and format for a specific service.
      Example: npm run check:style -- --fix twitter

    npm run check:style -- <fileOrFolder>
      Checks the code style and format for a specific file or folder.
      Example: npm run check:style -- common

    npm run check:style -- --fix <fileOrFolder>
      Checks and **autofixes** the code style and format for a specific file or folder.
      Example: npm run check:style -- --fix common

    npm run check:style -- --help
      Shows usage instructions.

    "
}

POSITIONAL=()
TSLINT_ARGS=()
PRETTIER_ARGS=("--check" "--no-color" "--loglevel" "log")

# Parse options
while [[ $# -gt 0 ]]; do
  key="$1"

  case ${key} in
      -h|--help)
      usage
      exit 0
      ;;
      -f|--fix)
      TSLINT_ARGS+=("--fix")
      PRETTIER_ARGS[0]="--write"
      shift
      ;;
      *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done

# Restore the remaining positional parameters
set -- "${POSITIONAL[@]}"

SCRIPTS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT="$( cd "$SCRIPTS/.." >/dev/null 2>&1 && pwd )"
ROOT_SRC="$ROOT/src"

# This would not be necessary if the script would always be executed via 'npm'
BIN="$ROOT/node_modules/.bin"

FILE="$1"

if [[ -z "$FILE" ]]; then
  echo "no files specified. Linting the whole project."
  FILE="."
elif [[ ! "$FILE" =~ (^\.)|/ && -d "$ROOT_SRC/service-$FILE" ]]; then
  # If the given file reference is NOT a path, check if we find an `service-`
  # prefixed folder for it and use that instead.
  echo "Linting 'service-$FILE'..."
  FILE="$ROOT_SRC/service-$FILE"
fi

if [[ -d "$FILE" ]]; then
  FILE="$FILE/**/*"
fi

"${BIN}"/prettier "${PRETTIER_ARGS[@]}" "$FILE"
"${BIN}"/tslint --config "$ROOT/tslint.json" --project "$ROOT/tsconfig.json" "${TSLINT_ARGS[@]}" "$FILE.ts"
