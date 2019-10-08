/// <reference types="react-scripts" />

declare namespace NodeJS {
    export interface ProcessEnv {
        REACT_APP_APP_ENVIRONMENT: string;
        REACT_APP_APP_REVISION: string;
        REACT_APP_API_URL: string;
        REACT_APP_APP_BASE_DOMAIN: string;
        REACT_APP_AUTHENTICATION_TOKEN_NAME: string;
        REACT_APP_HONEYBADGER_API_KEY: string;
        REACT_APP_MATOMO_URL: string;
        REACT_APP_MATOMO_SITEID: string;
    }
}
