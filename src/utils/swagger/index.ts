import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
    SWAGGER_API_ROOT,
    SWAGGER_API_NAME,
    SWAGGER_API_DESCRIPTION,
    SWAGGER_API_CURRENT_VERSION,
} from './constants';
import { SwaggerDocumentOptions } from './option.type';

/**
 * @export
 * @param {INestApplication} app
 * @returns {void}
 * @description Setup swagger for the application
 * @see {@link https://docs.nestjs.com/controllers#swagger-documentation}
 */

export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle(SWAGGER_API_NAME)
        .setDescription(SWAGGER_API_DESCRIPTION)
        .setVersion(SWAGGER_API_CURRENT_VERSION)
        .addBearerAuth()
        .build();

    const options: SwaggerDocumentOptions = {
        ignoreGlobalPrefix: true,
        operationIdFactory: (controllerKey: string, methodKey: string) =>
            methodKey,
    };
    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup(SWAGGER_API_ROOT, app, document, {
        customfavIcon: 'https://cdn-icons-png.flaticon.com/512/10095/10095455.png',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
        ],
        customCssUrl: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
        ],
    }
    );
}