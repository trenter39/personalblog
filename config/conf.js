import dotenv from 'dotenv';
dotenv.config();

export const {
    PORT,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT
} = process.env;