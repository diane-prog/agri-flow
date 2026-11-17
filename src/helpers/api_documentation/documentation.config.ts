import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const createSwaggerConfig = () => {
    const config = new DocumentBuilder()
        .setTitle('AgriFlow API')
        .setDescription(
            'Plateforme numérique de commercialisation et de coordination agricole au Bénin et en Afrique de l\'Ouest (B2B Marketplace).',
        )
        .setVersion('1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            'JWT',
        )
        .setLicense('Commercial', 'https://agriflow.bj')
        .setContact('AgriFlow Support', 'https://agriflow.bj', 'contact@agriflow.bj')
        .build();

    const customOptions: SwaggerCustomOptions = {
        swaggerOptions: {
            url: '/docs-json',
            filter: true,
            persistAuthorization: true,
            tagsSorter: 'alpha',
            docExpansion: 'none',
            operationsSorter: (a: any, b: any) => {
                const order = ['get', 'post', 'patch', 'delete'];
                const methodA = a.get('method');
                const methodB = b.get('method');

                if (methodA !== methodB) {
                    return order.indexOf(methodA) - order.indexOf(methodB);
                }

                return a.get('path').localeCompare(b.get('path'));
            },
        },
    };

    return { config, customOptions };
};
