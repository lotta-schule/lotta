import '@testing-library/jest-dom';

// stub out window.getSelection
// window.getSelection isn't in jsdom
// https://github.com/tmpvar/jsdom/issues/937
// @ts-ignore
window.getSelection = function () {
    return {
        addRange: function () {},
        removeAllRanges: function () {},
    };
};

window.location = {
    hash: '',
    host: 'test.lotta.schule',
    hostname: 'test.lotta.schule',
    origin: 'http://test.lotta.schule',
    href: 'http://test.lotta.schule',
    port: '',
    pathname: '/',
    search: '',
    protocol: 'http:',
    ancestorOrigins: [] as any,
    reload: () => {},
    replace: () => {},
    assign: (url) => Object.assign(window.location, { url: url }),
};
