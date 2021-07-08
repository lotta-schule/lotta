/// <reference types="react-scripts" />
declare namespace NodeJS {
    export interface ProcessEnv {
        PUBLIC_URL: string;
        REACT_APP_APP_ENVIRONMENT: string;
        REACT_APP_APP_REVISION: string;
        REACT_APP_API_URL: string;
        REACT_APP_API_SOCKET_URL: string;
        REACT_APP_AUTH_URL: string;
        REACT_APP_MATOMO_URL: string;
        REACT_APP_APP_BASE_DOMAIN: string;
        REACT_APP_SENTRY_DSN: string;
        REACT_APP_FILE_REPLACEMENT_URL: string;
    }
}
