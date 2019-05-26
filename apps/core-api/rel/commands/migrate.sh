#!/bin/sh

release_ctl eval --mfa "Api.ReleaseTasks.migrate/1" --argv -- "$@"