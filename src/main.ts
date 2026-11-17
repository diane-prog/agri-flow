import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { CircularInterceptor } from './common/interceptors/circular.interceptor';
import { CustomValidationPipe } from './common/response/customValidationPipe';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { buildCorsOptions } from './helpers/cors.config';
import { createSwaggerConfig } from './helpers/api_documentation/documentation.config';

/**
 * Boots the AgriFlow API.
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const env = configService.get<string>('app.nodeEnv');
    const port = configService.get<number>('app.port', 3000);

    app.use(helmet());
    app.enableCors(buildCorsOptions(env));
    app.setGlobalPrefix('api/v1', { exclude: ['/ping'] });

    app.useGlobalPipes(new CustomValidationPipe());

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(
        new ResponseInterceptor(),
        new CircularInterceptor(),
        new ClassSerializerInterceptor(reflector),
    );

    const enableSwagger =
        configService.get<boolean>('app.enableSwagger') || env === 'dev';

    if (enableSwagger) {
        const swaggerUsername = configService.get<string>(
            'app.swaggerUsername',
        );
        const swaggerPassword = configService.get<string>(
            'app.swaggerPassword',
        );

        if (swaggerUsername && swaggerPassword) {
            const basicAuthMiddleware =
                typeof basicAuth === 'function'
                    ? basicAuth
                    : (basicAuth as any)?.default || basicAuth;

            app.use(
                ['/docs', '/docs-json'],
                basicAuthMiddleware({
                    challenge: true,
                    users: {
                        [swaggerUsername]: swaggerPassword,
                    },
                }),
            );
        }

        const { config, customOptions } = createSwaggerConfig();
        const document = SwaggerModule.createDocument(app, config, {
            deepScanRoutes: true,
        });
        SwaggerModule.setup('docs', app, document, customOptions);
    }

    await app.listen(port, '0.0.0.0');

    console.log(`🌾 AgriFlow API is running on http://localhost:${port}/api/v1`);
    console.log(`📖 Swagger docs available on http://localhost:${port}/docs`);
}

bootstrap().catch((error: unknown) => {
    const message = error instanceof Error ? error.stack : String(error);
    console.error(`❌ Failed to start AgriFlow API: ${message}`);
    process.exit(1);
});
