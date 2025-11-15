require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3082;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})
connection.connect((err) => {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log("success connect");
})
let users = [
    { id:1, name:'taro' },
    { id:2, name:'hanako' },
];

app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).send('ユーザーが見つかりません');
    }
});

app.post('/users', (req, res) => {
    const newUser = {
        id: users.length + 1,
        name: req.body.name,
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);
    if (user) {
        user.name = req.body.name || user.name;
        res.json(user);
    } else {
        res.status(404).send('ユーザーが見つかりません');
    }
});

app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    users = users.filter(u => u.id !== id);
    res.status(204).send();
});