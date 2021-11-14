import '@jest/globals';
import '@testing-library/jest-dom';
import 'whatwg-fetch';

self.__NEXT_DATA__ = { ...self.__NEXT_DATA__ } as any;

// create setup document
const dialogContainer = document.createElement('div');
dialogContainer.setAttribute('id', 'dialogContainer');
document.body.appendChild(dialogContainer);

Element.prototype.scroll = jest.fn();
jest.mock('next/head', () => {
    const ReactDOMServer = require('react-dom/server');
    return {
        __esModule: true,
        default: ({
            children,
        }: {
            children: Array<React.ReactElement> | React.ReactElement | null;
        }) => {
            if (children) {
                global.document.head.insertAdjacentHTML(
                    'afterbegin',
                    ReactDOMServer.renderToString(children) || ''
                );
            }
            return null;
        },
    };
});
jest.mock('next/config', () => ({
    __esModule: true,
    default: () => ({
        publicRuntimeConfig: {
            appEnvironment: '',
            sentryDsn: '',
            socketUrl: '',
            cloudimageToken: '',
        },
    }),
}));
