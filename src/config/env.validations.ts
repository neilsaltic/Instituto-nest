import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('8h'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(4).max(15).default(10),
  INSTITUTION_NAME: Joi.string().default('UnidadEducativa'),
  MIN_PASSING_GRADE: Joi.number().min(0).max(100).default(51),
  MAX_STUDENTS_PER_GROUP: Joi.number().integer().positive().default(30),
  MOCKPAY_SECRET_KEY: Joi.string().required(),
});
