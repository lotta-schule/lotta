// @ts-check

/// <reference types="node" />
import './tracing.js';
import { createServer } from 'node:http';
import { parse } from 'node:url';
import next from 'next';

const port = process.env.PORT || 3000;

const startServer = async () => {
  const app = next({ dev: process.env.NODE_ENV !== 'production' });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? '/', true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Lotta listening on http://localhost:${port}`);
  });
};

startServer();
