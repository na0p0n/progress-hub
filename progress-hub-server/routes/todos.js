const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoController');

// ユーザー作成API
// URL: POST (/api/users/todo)
router.post('/', todoController.createTodo);

// 全ユーザー取得API
// URL: GET (/api/todos/)
router.get('/', todoController.getAllTodos);

// 指定ユーザー取得API
// URL: GET (/api/todos/:id)
router.get('/:id', todoController.getTodo);

// ユーザー情報変更API
// URL: PATCH (/api/todos/:id)
router.patch('/:id', todoController.updateTodo);

// ユーザー削除API
// URL: DELETE (/api/todos/:id)
router.delete('/:id', todoController.deleteTodo);
