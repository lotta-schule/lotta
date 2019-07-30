/// <reference types="react-scripts" />

declare namespace NodeJS {
    export interface ProcessEnv {
        REACT_APP_API_URL: string;
        REACT_APP_APP_BASE_DOMAIN: string;
        REACT_APP_AUTHENTICATION_TOKEN_NAME: string;
        SENTRY_DSN: string;
    }
}
