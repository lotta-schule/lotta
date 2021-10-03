declare namespace NodeJS {
    export interface ProcessEnv {
        PUBLIC_URL: string;
        APP_ENVIRONMENT: string;
        API_SOCKET_URL: string;
        SENTRY_DSN: string;
        API_URL: string;
        AUTH_URL: string;
        FORCE_BASE_URL?: string;
    }
}
