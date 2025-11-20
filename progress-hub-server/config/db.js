require('dotenv').config();
const mysql = require('mysql');
const port = 3082;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

connection.connect((err) => {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log("success connect");
});

module.exports = connection;