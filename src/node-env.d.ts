declare namespace NodeJS {
    export interface ProcessEnv {
        API_SOCKET_URL: string;
        API_URL: string;
        APP_ENVIRONMENT: string;
        CLOUDIMG_TOKEN?: string;
        FORCE_BASE_URL?: string;
        FORCE_TENANT_SLUG?: string;
        NODE_ENV?: string;
        SENTRY_DSN?: string;
    }
}
