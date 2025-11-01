// At the very top of your file, load the .env variables
require('dotenv').config();

const { Sequelize } = require('sequelize');

// Use environment variables for configuration
const sequelize = new Sequelize(
    process.env.DB_NAME,       // 'expense'
    process.env.DB_USER,       // 'root'
    process.env.DB_PASS,       // 'Divhari1@'
    {
        host: process.env.DB_HOST,     // 'localhost'
        dialect: process.env.DB_DIALECT // 'mysql'
    }
);

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

test();

module.exports = sequelize;