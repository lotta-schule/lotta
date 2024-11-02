#!/bin/bash

# migrate database
./bin/lotta eval "Application.ensure_all_started(:lotta)" # Do not check in
./bin/lotta eval "Lotta.Release.migrate()"

# start the server
./bin/lotta $@
