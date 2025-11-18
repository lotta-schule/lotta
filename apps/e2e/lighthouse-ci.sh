TENANT_ID=$(node -r ts-node/register scripts/lh_tenant/setup)

pnpm dlx @lhci/cli collect --numberOfRuns=3 --url=https://info.lotta.schule
pnpm dlx @lhci/cli upload --target=temporary-public-storage
