const config = {
    development:{
        port: parseInt(process.env.PORT, 10) || 3000,
        database: {
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        }
    },
    production:{
        port: parseInt(process.env.PORT, 10) || 3000,
        databaseUrl: process.env.DATABASE_URL,
    }
}

export default config[process.env.NODE_ENV || 'development'];
