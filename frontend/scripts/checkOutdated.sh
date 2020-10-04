#!/usr/bin/env bash

set -eo pipefail

if [[ -n "$1" ]]; then
    UPGRADE=true;
else
    UPGRADE=false;
fi

npm install --no-package-lock --no-save npm-check-updates

if $UPGRADE; then
  npm-check-updates -u --packageFile "$1"
else
  npm-check-updates --packageFile "package.json"
fi