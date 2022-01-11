import { NextApiHandler } from 'next';
import chromium from 'chrome-aws-lambda';
import Puppeteer from 'puppeteer-core';

const handler: NextApiHandler = async (req, res) => {
    if (req.headers.host) {
        const protocol = (req.connection as any)?.secure ? 'https' : 'http';
        const url = `${protocol}://${req.headers.host}/a/${req.query.articleId}`;

        const browser = await Puppeteer.launch({
            headless: true,
            args: chromium.args,
            executablePath: await chromium.executablePath,
            dumpio: true,
        });
        const page = await browser.newPage();
        const extraHeaders: Record<string, string> = {};
        if (req.headers.authorization) {
            extraHeaders['authorization'] = req.headers.authorization;
        }
        page.setExtraHTTPHeaders(extraHeaders);
        page.setJavaScriptEnabled(false);
        await page.goto(url);
        const pdfStream = await page.createPDFStream({
            format: 'a4',
        });
        res.setHeader('Content-Type', 'application/pdf');
        pdfStream.pipe(res);
    } else {
        res.send(404);
    }
};

export default handler;
