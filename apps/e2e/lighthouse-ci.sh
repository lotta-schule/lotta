#!/bin/bash

export BASE_URI_HOST=${BASE_URI_HOST:-"local.lotta.schule"}
export BASE_URI_SCHEME=${BASE_URI_SCHEME:-"http"}
export BASE_URI_PORT=${BASE_URI_PORT:-"3000"}
export CORE_URL=${CORE_URL:-"http://localhost:4000"}
export ADMIN_USERNAME=${ADMIN_USERNAME:-"admin"}
export ADMIN_PASSWORD=${ADMIN_PASSWORD:-"secretapikey"}

node -r ts-node/register scripts/lh_tenant/setup

pnpm dlx @lhci/cli collect --numberOfRuns=3 --url=http://lighthouse.local.lotta.schule:3000
pnpm dlx @lhci/cli upload --target=temporary-public-storage
