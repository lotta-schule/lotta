import { NextApiHandler } from 'next';
import Puppeteer from 'puppeteer-core';

const handler: NextApiHandler = async (req, res) => {
    if (!process.env.BROWSERLESS_CHROME_ENDPONT) {
        console.error('You did not configure BROWSERLESS_CHROME_ENDPONT');
        res.send(400);
    }
    if (req.headers.host) {
        const protocol = (req.connection as any)?.secure ? 'https' : 'http';
        const url = `${protocol}://${req.headers.host}/a/${req.query.articleId}`;

        console.log('get URL', url);
        const browser = await Puppeteer.connect({
            browserWSEndpoint: `ws://${process.env.BROWSERLESS_CHROME_ENDPONT}`,
        });
        const page = await browser.newPage();
        const extraHeaders: Record<string, string> = {};
        if (req.headers.authorization) {
            extraHeaders['authorization'] = req.headers.authorization;
        }
        page.setExtraHTTPHeaders(extraHeaders);
        page.setJavaScriptEnabled(false);
        await page.goto(url, { waitUntil: 'networkidle2' });
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
