const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

const startServer = async () => {
    await app.prepare();
    const { tracing } = await import('./tracing.mjs');

    tracing.start();

    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    server.listen(port, () => {
        console.log(`> Lotta listening on http://localhost:${port}`);
    });
};

startServer();
