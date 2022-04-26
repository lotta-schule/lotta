// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextMiddleware, NextResponse } from 'next/server';

const handler: NextMiddleware = async (req) => {
    if (!process.env.BROWSERLESS_CHROME_ENDPONT) {
        console.error('You did not configure BROWSERLESS_CHROME_ENDPONT');
        return new Response(null, { status: 400 });
    }
    const nextUrl = req.nextUrl;

    if (/\.pdf$/.test(nextUrl.pathname)) {
        const originalRequestResponse = await fetch(
            nextUrl.href.replace(/\.pdf$/, ''),
            { headers: req.headers }
        );
        const htmlContent = (await originalRequestResponse.text()).replace(
            '<head>',
            `<head><base href="${nextUrl.origin}" />`
        );
        return fetch(`${process.env.BROWSERLESS_CHROME_ENDPONT}/pdf`, {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            }),
            body: JSON.stringify({
                html: htmlContent,
                options: {
                    displayHeaderFooter: false,
                    printBackground: false,
                    format: 'A4',
                },
                gotoOptions: {
                    waitUntil: 'networkidle0',
                },
            }),
        });
    }

    return NextResponse.next();
};

export default handler;
