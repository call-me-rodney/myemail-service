export default () => ({
  environment: process.env.NODE_ENV || 'development',

  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.APP_HOST || 'localhost:3000',
  },

  database: {
    dialect: 'postgres',
    // Used in development and demo (individual vars)
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    // Used in production (single connection string)
    url: process.env.DATABASE_URL,
  },

  emailjs: {
    publickey: process.env.EMAILJS_PUBLIC_KEY,
    privatekey: process.env.EMAILJS_PRIVATE_KEY,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'changeme',
    expiration: process.env.JWT_EXPIRATION || '1d',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },
});
