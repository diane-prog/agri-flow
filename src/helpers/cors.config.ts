const DEV_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081', // Expo / React Native dev
    'http://localhost:19006', // Expo web
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
] as const;

const PROD_ORIGINS = [
    'https://agriflow.bj',
    'https://www.agriflow.bj',
    'https://admin.agriflow.bj',
    'https://app.agriflow.bj',
] as const;

function usesDevOrigins(env: string | undefined): boolean {
    return ['dev', 'development', 'staging', 'local'].includes(env ?? 'dev');
}

export function buildCorsOptions(env: string | undefined) {
    const configuredFrontend = process.env.FRONTEND_URL;
    const allowedOrigins = usesDevOrigins(env)
        ? [...DEV_ORIGINS, configuredFrontend].filter(Boolean)
        : [...PROD_ORIGINS, configuredFrontend].filter(Boolean);

    return {
        origin: (
            origin: string | undefined,
            callback: (error: Error | null, allow?: boolean) => void,
        ) => {
            if (!origin) {
                callback(null, usesDevOrigins(env));
                return;
            }

            callback(null, allowedOrigins.includes(origin));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    };
}
