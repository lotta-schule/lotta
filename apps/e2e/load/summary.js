// Turns k6's end-of-test data into a short Markdown report (for PR comments
// and job summaries) and a plain-text table (for the terminal).

const ms = (value) =>
  value === undefined
    ? '–'
    : value >= 1000
      ? `${(value / 1000).toFixed(2)} s`
      : `${Math.round(value)} ms`;

const thresholdsOk = (metric) =>
  !metric || !metric.thresholds
    ? true
    : Object.values(metric.thresholds).every((t) => t.ok);

export function buildSummary(data, { baseUrl, vus, duration, requests }) {
  const metrics = data.metrics;
  const rows = Object.entries(requests).map(([name, p95Limit]) => {
    const duration = metrics[`http_req_duration{name:${name}}`];
    const count = metrics[`http_reqs{name:${name}}`];
    const values = (duration && duration.values) || {};
    return {
      name,
      ok: thresholdsOk(duration),
      count: count ? count.values.count : 0,
      med: values.med,
      p95: values['p(95)'],
      p99: values['p(99)'],
      p95Limit,
    };
  });

  const total = metrics.http_reqs ? metrics.http_reqs.values : {};
  const failed = metrics.http_req_failed
    ? metrics.http_req_failed.values.rate
    : 0;
  const failedOk = thresholdsOk(metrics.http_req_failed);
  const failedChecks = metrics.checks ? metrics.checks.values.fails : 0;
  const allOk = failedOk && rows.every((r) => r.ok);

  const headline =
    `${vus} virtual users for ${duration} against \`${baseUrl}\` · ` +
    `${total.count || 0} requests (${(total.rate || 0).toFixed(1)}/s) · ` +
    `${(failed * 100).toFixed(2)}% failed`;

  const markdown = [
    '### 🏋️ Load test',
    '',
    headline,
    '',
    '| | Request | Median | p95 | p99 | Requests |',
    '| :-: | :-- | --: | --: | --: | --: |',
    ...rows.map(
      (r) =>
        `| ${r.ok ? '✅' : '❌'} | ${r.name} | ${ms(r.med)} | ${ms(r.p95)} | ${ms(r.p99)} | ${r.count} |`
    ),
    '',
    allOk
      ? '✅ All thresholds passed.'
      : `❌ Thresholds failed: ${[
          ...rows
            .filter((r) => !r.ok)
            .map((r) => `${r.name} (p95 ${ms(r.p95)} > ${ms(r.p95Limit)})`),
          ...(failedOk
            ? []
            : [`failed requests ${(failed * 100).toFixed(2)}% ≥ 1%`]),
        ].join(', ')}.`,
    ...(failedChecks > 0
      ? [
          '',
          `⚠️ ${failedChecks} response checks failed (wrong status or GraphQL errors).`,
        ]
      : []),
    '',
  ].join('\n');

  const pad = (value, width) => String(value).padStart(width);
  const text = [
    '',
    `Load test: ${headline.replace(/`/g, '')}`,
    '',
    `   ${'Request'.padEnd(20)}${pad('Median', 9)}${pad('p95', 9)}${pad('p99', 9)}${pad('Reqs', 7)}`,
    ...rows.map(
      (r) =>
        `${r.ok ? ' ✓ ' : ' ✗ '}${r.name.padEnd(20)}${pad(ms(r.med), 9)}${pad(ms(r.p95), 9)}${pad(ms(r.p99), 9)}${pad(r.count, 7)}`
    ),
    '',
    allOk ? 'All thresholds passed.' : 'Some thresholds failed, see above.',
    '',
  ].join('\n');

  return { markdown, text };
}
