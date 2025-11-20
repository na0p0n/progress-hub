require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/users');

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

const PORT = process.env.PORT || 3000;
