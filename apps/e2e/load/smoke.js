// k6 load test: what a visitor's page views cost the web and core servers.
//
//   k6 run apps/e2e/load/smoke.js
//   BASE_URL=https://test.lotta.schule VUS=20 DURATION=2m k6 run apps/e2e/load/smoke.js
//
// Every iteration loads the home, a category and an article page (server
// rendered by the web app) and sends the GraphQL queries those pages send.
// Writes a Markdown summary to `load-test-report.md` (see ./summary.js).
import http from 'k6/http';
import { check, sleep } from 'k6';
import { buildSummary } from './summary.js';

const BASE_URL = (
  __ENV.BASE_URL || 'http://lighthouse.local.lotta.schule:3000'
).replace(/\/$/, '');
const VUS = Number(__ENV.VUS || 10);
const DURATION = __ENV.DURATION || '1m';

const QUERIES = {
  categories: open('../../webapp/src/api/query/GetCategoriesQuery.graphql'),
  articles: open('../../webapp/src/api/query/GetArticlesQuery.graphql'),
};

// The requests of one iteration and the p95 latency each one should stay under.
// A threshold per request name is also what makes k6 report it separately.
export const REQUESTS = {
  'home page': 1500,
  'category page': 1500,
  'article page': 1500,
  'graphql categories': 500,
  'graphql articles': 500,
};

export const options = {
  scenarios: {
    visitors: { executor: 'constant-vus', vus: VUS, duration: DURATION },
  },
  thresholds: Object.fromEntries([
    ['http_req_failed', ['rate<0.01']],
    ...Object.entries(REQUESTS).flatMap(([name, p95]) => [
      [`http_req_duration{name:${name}}`, [`p(95)<${p95}`]],
      [`http_reqs{name:${name}}`, ['count>=0']],
    ]),
  ]),
  summaryTrendStats: ['med', 'p(95)', 'p(99)', 'max'],
};

function graphql(name, query, variables = {}, tag = `graphql ${name}`) {
  const res = http.post(
    `${BASE_URL}/api`,
    JSON.stringify({ query, variables }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: tag },
    }
  );
  check(res, {
    [`graphql ${name}: 200 without errors`]: (r) =>
      r.status === 200 && !r.json('errors'),
  });
  return res;
}

function page(name, path) {
  const res = http.get(`${BASE_URL}${path}`, { tags: { name } });
  check(res, { [`${name}: 200`]: (r) => r.status === 200 });
  return res;
}

// Find a category and an article to request, once before the test.
export function setup() {
  // Tagged 'setup' so these requests don't count towards the results.
  const categories = graphql(
    'categories',
    QUERIES.categories,
    {},
    'setup'
  ).json('data.categories');
  if (!categories || categories.length === 0) {
    throw new Error(
      `No categories found at ${BASE_URL}. Is the tenant set up?`
    );
  }
  const homepage = categories.find((c) => c.isHomepage) || categories[0];
  const category = categories.find((c) => !c.isHomepage) || homepage;

  const articles =
    graphql(
      'articles',
      QUERIES.articles,
      { categoryId: homepage.id, filter: { first: 10 } },
      'setup'
    ).json('data.articles') || [];

  return {
    homepageId: homepage.id,
    categoryId: category.id,
    articleId: articles.length > 0 ? articles[0].id : null,
  };
}

export default function ({ homepageId, categoryId, articleId }) {
  page('home page', '/');
  graphql('categories', QUERIES.categories);
  graphql('articles', QUERIES.articles, {
    categoryId: homepageId,
    filter: { first: 10 },
  });

  page('category page', `/c/${categoryId}`);

  if (articleId) {
    page('article page', `/a/${articleId}`);
  }

  sleep(1);
}

export function handleSummary(data) {
  const { markdown, text } = buildSummary(data, {
    baseUrl: BASE_URL,
    vus: VUS,
    duration: DURATION,
    requests: REQUESTS,
  });
  return { stdout: text, 'load-test-report.md': markdown };
}
