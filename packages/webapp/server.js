const { createServer } = require('http');
const { parse } = require('url');

const port = process.env.PORT || 3000;

const startServer = async () => {
  require('./tracing.cjs');
  const next = require('next');

  const app = next({ dev: process.env.NODE_ENV !== 'production' });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Lotta listening on http://localhost:${port}`);
  });
};

require('./fetch.cjs')().then(() => {
  startServer();
});
