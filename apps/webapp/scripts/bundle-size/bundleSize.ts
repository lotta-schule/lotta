/**
 * Bundle size statistics for the Next.js (Turbopack) build output.
 *
 * "First load" of a route = the shared root chunks plus every client chunk
 * listed for the route's entries (layouts, error boundaries, page) in its
 * `page_client-reference-manifest.js`. Sizes are gzip-compressed bytes, which
 * is roughly what browsers download.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { runInNewContext } from 'node:vm';

export type RouteStats = { route: string; firstLoad: number };

export type BundleStats = {
  commit: string | null;
  /** gzip bytes of the chunks every route loads */
  shared: number;
  /** gzip bytes of all JS chunks in the build */
  total: number;
  routes: RouteStats[];
};

type RscManifest = Record<string, { entryJSFiles?: Record<string, string[]> }>;

export function collectStats(
  nextDir: string,
  commit: string | null = null
): BundleStats {
  const gzipCache = new Map<string, number>();
  const gzipSize = (file: string) => {
    let size = gzipCache.get(file);
    if (size === undefined) {
      size = gzipSync(readFileSync(join(nextDir, file))).length;
      gzipCache.set(file, size);
    }
    return size;
  };
  const sumOf = (files: Iterable<string>) =>
    [...files].reduce((sum, file) => sum + gzipSize(file), 0);

  const buildManifest = JSON.parse(
    readFileSync(join(nextDir, 'build-manifest.json'), 'utf8')
  ) as { rootMainFiles?: string[] };
  const rootFiles = buildManifest.rootMainFiles ?? [];

  const routes = new Map<string, number>();
  for (const manifestFile of findFiles(
    join(nextDir, 'server', 'app'),
    'page_client-reference-manifest.js'
  )) {
    const context = { globalThis: {} as { __RSC_MANIFEST?: RscManifest } };
    runInNewContext(readFileSync(manifestFile, 'utf8'), context);
    for (const [entry, manifest] of Object.entries(
      context.globalThis.__RSC_MANIFEST ?? {}
    )) {
      const files = new Set(rootFiles);
      for (const chunks of Object.values(manifest.entryJSFiles ?? {})) {
        chunks.forEach((chunk) => files.add(chunk));
      }
      const route = toRouteName(entry);
      routes.set(route, Math.max(routes.get(route) ?? 0, sumOf(files)));
    }
  }

  const chunksDir = join(nextDir, 'static', 'chunks');
  const allChunks = existsSync(chunksDir)
    ? findFiles(chunksDir, '.js').map((file) =>
        relative(nextDir, file).split(sep).join('/')
      )
    : [];

  return {
    commit,
    shared: sumOf(rootFiles),
    total: sumOf(allChunks),
    routes: [...routes]
      .map(([route, firstLoad]) => ({ route, firstLoad }))
      .sort((a, b) => a.route.localeCompare(b.route)),
  };
}

/** "/(default)/a/[slug]/page" → "/a/[slug]" */
export function toRouteName(entry: string): string {
  const route = entry
    .replace(/\/page$/, '')
    .split('/')
    .filter((segment) => segment && !/^\(.*\)$/.test(segment))
    .join('/');
  return `/${route}`;
}

function findFiles(dir: string, suffix: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => join(entry.parentPath, entry.name));
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

export type ReportOptions = {
  /** Changes smaller than this (bytes) are not listed. Default: 500 B */
  threshold?: number;
  /** Maximum number of changed routes listed above the fold. Default: 10 */
  maxRows?: number;
  /** Shown as the comparison target, e.g. "main" */
  baseLabel?: string;
};

export function formatBytes(bytes: number): string {
  const abs = Math.abs(bytes);
  if (abs < 1000) return `${bytes} B`;
  if (abs < 1_000_000) return `${(bytes / 1000).toFixed(1)} kB`;
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

export function formatDelta(delta: number, base?: number): string {
  if (delta === 0) return '±0';
  const sign = delta > 0 ? '+' : '−';
  const size = `${sign}${formatBytes(Math.abs(delta))}`;
  if (!base) return size;
  return `${size} (${sign}${((Math.abs(delta) / base) * 100).toFixed(1)}%)`;
}

type RouteChange = {
  route: string;
  head?: number;
  base?: number;
  delta: number;
};

export function buildReport(
  head: BundleStats,
  base: BundleStats | null,
  options: ReportOptions = {}
): string {
  const { threshold = 500, maxRows = 10, baseLabel = 'main' } = options;
  const lines: string[] = ['### 📦 Bundle size', ''];

  if (!base) {
    lines.push(
      `First-load JS per route (gzip). No baseline from \`${baseLabel}\` yet, so only absolute sizes are shown.`,
      '',
      '| Route | First load |',
      '| :-- | --: |',
      ...[...head.routes]
        .sort((a, b) => b.firstLoad - a.firstLoad)
        .slice(0, maxRows)
        .map((r) => `| \`${r.route}\` | ${formatBytes(r.firstLoad)} |`),
      '',
      `Shared by all routes: **${formatBytes(head.shared)}** · All JS chunks: **${formatBytes(head.total)}**`
    );
    return lines.join('\n') + '\n';
  }

  const changes = compareRoutes(head, base);
  const notable = changes
    .filter((c) => Math.abs(c.delta) >= threshold || !c.head || !c.base)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const baseRef = base.commit
    ? `\`${baseLabel}\` (${base.commit.slice(0, 7)})`
    : `\`${baseLabel}\``;
  lines.push(`First-load JS per route (gzip), compared with ${baseRef}.`, '');

  if (notable.length === 0) {
    lines.push(
      `✅ No route changed by more than ${formatBytes(threshold)}.`,
      ''
    );
  } else {
    lines.push(
      '| | Route | First load | Change |',
      '| :-: | :-- | --: | --: |',
      ...notable.slice(0, maxRows).map(changeRow)
    );
    if (notable.length > maxRows) {
      lines.push(
        '',
        `…and ${notable.length - maxRows} more, see all routes below.`
      );
    }
    lines.push('');
  }

  lines.push(
    `Shared by all routes: **${formatBytes(head.shared)}** (${formatDelta(head.shared - base.shared)}) · ` +
      `All JS chunks: **${formatBytes(head.total)}** (${formatDelta(head.total - base.total)})`,
    '',
    `<details><summary>All ${head.routes.length} routes</summary>`,
    '',
    '| Route | First load | Change |',
    '| :-- | --: | --: |',
    ...changes
      .filter((c) => c.head !== undefined)
      .map(
        (c) =>
          `| \`${c.route}\` | ${formatBytes(c.head!)} | ${c.base === undefined ? 'new' : formatDelta(c.delta)} |`
      ),
    '',
    '</details>'
  );

  return lines.join('\n') + '\n';
}

function compareRoutes(head: BundleStats, base: BundleStats): RouteChange[] {
  const baseSizes = new Map(base.routes.map((r) => [r.route, r.firstLoad]));
  const headSizes = new Map(head.routes.map((r) => [r.route, r.firstLoad]));
  const routes = [...new Set([...headSizes.keys(), ...baseSizes.keys()])];

  return routes.sort().map((route) => {
    const h = headSizes.get(route);
    const b = baseSizes.get(route);
    return { route, head: h, base: b, delta: (h ?? 0) - (b ?? 0) };
  });
}

function changeRow({ route, head, base, delta }: RouteChange): string {
  if (base === undefined)
    return `| ➕ | \`${route}\` | ${formatBytes(head!)} | new |`;
  if (head === undefined)
    return `| ➖ | \`${route}\` | – | removed (${formatBytes(base)}) |`;
  const icon = delta > 0 ? '🔺' : '🔻';
  return `| ${icon} | \`${route}\` | ${formatBytes(head)} | ${formatDelta(delta, base)} |`;
}
