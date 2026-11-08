/**
 * Usage (from apps/webapp, after `next build`):
 *
 *   bun scripts/bundle-size/cli.ts collect [--next-dir .next] [--out bundle-stats.json]
 *   bun scripts/bundle-size/cli.ts report --head bundle-stats.json \
 *     [--base base/bundle-stats.json] [--base-label main] [--out bundle-report.md]
 *
 * `collect` writes per-route first-load JS sizes as JSON. `report` turns one
 * (or two, for a comparison) of those files into a Markdown summary.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { buildReport, collectStats, type BundleStats } from './bundleSize';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    'next-dir': { type: 'string', default: '.next' },
    out: { type: 'string' },
    head: { type: 'string', default: 'bundle-stats.json' },
    base: { type: 'string' },
    'base-label': { type: 'string', default: 'main' },
  },
});

const readStats = (file: string): BundleStats =>
  JSON.parse(readFileSync(file, 'utf8'));

switch (positionals[0]) {
  case 'collect': {
    const stats = collectStats(
      values['next-dir'],
      process.env.GITHUB_SHA ?? null
    );
    const out = values.out ?? 'bundle-stats.json';
    writeFileSync(out, JSON.stringify(stats, null, 2) + '\n');
    console.log(
      `Collected ${stats.routes.length} routes → ${out} (all JS chunks: ${stats.total} B gzip)`
    );
    break;
  }
  case 'report': {
    const base =
      values.base && existsSync(values.base) ? readStats(values.base) : null;
    const report = buildReport(readStats(values.head), base, {
      baseLabel: values['base-label'],
    });
    if (values.out) writeFileSync(values.out, report);
    console.log(report);
    break;
  }
  default:
    console.error('Usage: cli.ts <collect|report> [options]');
    process.exit(1);
}
