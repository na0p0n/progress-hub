const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// ユーザー作成API
// URL: POST (/api/users/)
router.post('/', userController.createUser);

// 全ユーザー取得API
// URL: GET (/api/users/)
router.get('/', userController.getAllUsers);

// 指定ユーザー取得API
// URL: GET (/api/users/:id)
router.get('/:id', userContoroller.getUser);

// ユーザー情報変更API
// URL: PATCH (/api/users/:id)
router.patch('/:id', userController.updateUser);

// ユーザー削除API
// URL: DELETE (/api/users/:id)
router.delete('/:id', userController.deleteUser);