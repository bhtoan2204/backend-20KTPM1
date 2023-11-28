import * as Joi from 'joi';


export const validateSchemaConfig = Joi.object({
    NODE_ENV: Joi.string().valid(
        'development',
        'production',
    ),
    PORT: Joi.number().default(8080),
    SESSION_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.number().required(),
    JWT_SECRET: Joi.string().required(),
    REFRESH_EXPIRATION: Joi.number().required(),
    JWT_SECRET_REFRESH: Joi.string().required(),
    MONGO_URI: Joi.string().required(),
    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_REFRESH_TOKEN: Joi.string().required(),
    GOOGLE_EMAIL: Joi.string().required(),
    GOOGLE_CALLBACK_URL: Joi.string().required(),
    FACEBOOK_CLIENT_ID: Joi.string().required(),
    FACEBOOK_CLIENT_SECRET: Joi.string().required(),
    FACEBOOK_CALLBACK_URL: Joi.string().required(),
    AZURE_STORAGE_CONNECTION: Joi.string().required(),
    AZURE_STORAGE_CONTAINER: Joi.string().required(),
    ELASTICSEARCH_NODE: Joi.string().required(),
    ELASTICSEARCH_USERNAME: Joi.string().required(),
    ELASTICSEARCH_PASSWORD: Joi.string().required(),
    FRONTEND_URL: Joi.string().required(),
});