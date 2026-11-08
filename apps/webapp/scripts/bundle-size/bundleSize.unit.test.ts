import { describe, expect, it } from 'vitest';
import {
  buildReport,
  formatBytes,
  formatDelta,
  toRouteName,
  type BundleStats,
} from './bundleSize';

const stats = (
  routes: Record<string, number>,
  overrides: Partial<BundleStats> = {}
): BundleStats => ({
  commit: null,
  shared: 100_000,
  total: 1_000_000,
  routes: Object.entries(routes).map(([route, firstLoad]) => ({
    route,
    firstLoad,
  })),
  ...overrides,
});

describe('toRouteName', () => {
  it('drops route groups and the trailing /page', () => {
    expect(toRouteName('/(default)/a/[slug]/page')).toBe('/a/[slug]');
    expect(toRouteName('/(admin)/admin/users/page')).toBe('/admin/users');
    expect(toRouteName('/(default)/page')).toBe('/');
  });
});

describe('formatBytes / formatDelta', () => {
  it('formats sizes with decimal units', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(12_345)).toBe('12.3 kB');
    expect(formatBytes(1_234_567)).toBe('1.23 MB');
  });

  it('formats signed deltas, with percentage when a base is given', () => {
    expect(formatDelta(0)).toBe('±0');
    expect(formatDelta(1_500)).toBe('+1.5 kB');
    expect(formatDelta(-3_300, 660_000)).toBe('−3.3 kB (−0.5%)');
  });
});

describe('buildReport', () => {
  it('shows the largest routes when there is no baseline', () => {
    const report = buildReport(
      stats({ '/': 300_000, '/a/[slug]': 650_000 }),
      null
    );

    expect(report).toContain('No baseline from `main` yet');
    expect(report.indexOf('`/a/[slug]`')).toBeLessThan(report.indexOf('`/`'));
  });

  it('says so when nothing changed above the threshold', () => {
    const report = buildReport(
      stats({ '/': 300_100 }),
      stats({ '/': 300_000 })
    );

    expect(report).toContain('✅ No route changed by more than 500 B.');
    expect(report).toContain('<details><summary>All 1 routes</summary>');
  });

  it('lists notable changes, biggest first, including new and removed routes', () => {
    const report = buildReport(
      stats({ '/': 310_000, '/a/[slug]': 600_000, '/new': 200_000 }),
      stats(
        { '/': 300_000, '/a/[slug]': 650_000, '/old': 100_000 },
        { commit: 'abcdef1234567' }
      )
    );
    const table = report.split('<details>')[0];

    expect(table).toContain('compared with `main` (abcdef1)');
    expect(table).toContain(
      '| 🔻 | `/a/[slug]` | 600.0 kB | −50.0 kB (−7.7%) |'
    );
    expect(table).toContain('| 🔺 | `/` | 310.0 kB | +10.0 kB (+3.3%) |');
    expect(table).toContain('| ➕ | `/new` | 200.0 kB | new |');
    expect(table).toContain('| ➖ | `/old` | – | removed (100.0 kB) |');
    expect(table.indexOf('/new')).toBeLessThan(table.indexOf('`/`'));
  });

  it('caps the summary table and points to the full list', () => {
    const head = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [`/r${i}`, 10_000 + i * 1_000])
    );
    const base = Object.fromEntries(Object.keys(head).map((r) => [r, 1_000]));

    const report = buildReport(stats(head), stats(base), { maxRows: 5 });

    expect(report).toContain('…and 7 more, see all routes below.');
  });
});
