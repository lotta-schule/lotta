#!/bin/bash

build_watch_pid=""

# Kill the watchers on exit
trap "kill $build_watch_pid" EXIT

# Start the watchers
./node_modules/.bin/nx watch --projects=hubert -- ./node_modules/.bin/nx run \$NX_PROJECT_NAME:build &
build_watch_pid=$!

# Run dev task
./node_modules/.bin/nx run-many --target=dev --parallel
