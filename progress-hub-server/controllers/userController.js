const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('../config/db');
const message = require('../config/message');
const util = require('util');
const ALLOWED_FIELDS = ['user_name', 'display_name', 'icon_url'];

const queryPromise = util.promisify(connection.query).bind(connection);

// 全ユーザー取得API
// URL: GET (api/users/)
// すべてのユーザーを取得する
exports.getAllUsers = async (req, res) => {
    const query = 'SELECT id, user_name, display_name, icon_url, created_at, updated_at FROM users WHERE deleted_at IS NULL;';
    try {
        const results = await queryPromise(query);
        res.json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: message.ERRORS.ERROR.FETCH_ERROR
        });
    }
};

// ユーザー取得API
// URL: GET (/api/users/:id)
// 指定したidのユーザー情報を取得する
exports.getUser = async (req, res) => {
    const query = 'SELECT user_name, display_name, icon_url, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL;';
    const user_id = [ req.params.id ];
    try {
        const results = await queryPromise(query, user_id);
        if (results.length === 0) { 
            return res.status(404).json({
                error: message.ERRORS.USER_DB.USER_NOT_FOUND
            });
        }
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: message.ERRORS.ERROR.FETCH_ERROR
        });
    }
};

// ユーザー作成API
// URL: POST (/api/users/)
// 入力値をユーザーTBLに追加する
exports.createUser = async (req, res) => {
    const { user_name, display_name, password, icon_url } = req.body; 
    const query = 'INSERT INTO users (user_name, display_name, password_hash, icon_url) VALUES(?, ?, ?, ?);';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const params = [user_name, display_name, hashedPassword, icon_url];

        const results = await queryPromise(query, params);
        res.status(201).json({
            message: message.SUCCESS.USER_DB.USER_CREATE_SUCCESS,
            userId: results.insertId
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: message.ERRORS.ERROR.REQUEST_ERROR
        });
    }
};

// ユーザー情報変更API
// URL: PATCH (/api/users/:id)
// req.bodyのキーと値を読み取り、指定のユーザー情報を変更する
exports.updateUser = async (req, res) => {
    const query = 'UPDATE users SET ? WHERE id = ?';
    const userId = req.params.id;
    const updates = req.body;
    const incomingKeys = Object.keys(updates);

    if (incomingKeys.length !== 1) {
        return res.status(400).json({
            error: message.ERRORS.UPDATE_USER.INVALID_FIELD_COUNT
        });
    }

    const keyToUpdate = incomingKeys[0];

    if (!ALLOWED_FIELDS.includes(keyToUpdate)) {
        return res.status(400).json({
            error: message.ERRORS.UPDATE_USER.FIELD_NOT_FOUND
        });
    }

    try {
        const results = await queryPromise(query, [req.body, userId]);

        if (results.affectedRows === 0) {
            return res.status(404).json({
                error: message.ERRORS.USER_DB.USER_NOT_FOUND
            });
        }
        res.status(200).json({
            message: message.SUCCESS.USER_DB.USER_UPDATE_SUCCESS
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: message.ERRORS.ERROR.REQUEST_ERROR
        });        
    }
}

// ユーザー削除API
// URL: DELETE (/api/users/:id)
// パスワードを検証し、あっていれば削除を実行
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    const { password } = req.body;
    const deleteQuery = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?;';

    try {
        const isMatch = await fetchPasswordHash(userId, password);

        if (isMatch === null) {
            return res.status(404).json({
                error: message.ERRORS.USER_DB.USER_NOT_FOUND
            })
        }
        if (isMatch === false) { 
            return res.status(401).json({
                error: message.ERRORS.AUTH.INVALID_CREDENTIALS
            });
        }

        const results = await queryPromise(deleteQuery, [userId]);

        if (results.affectedRows === 0) {
            return res.status(404).json({
                error: message.ERRORS.USER_DB.USER_NOT_FOUND
            });
        }

        return res.status(200).json({
            message: message.SUCCESS.USER_DB.USER_DELETE_SUCCESS
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: message.ERRORS.ERROR.REQUEST_ERROR
        });
    }
};

// パスワード検証メソッド
async function fetchPasswordHash(id, password) {
    const query = `SELECT password_hash FROM users WHERE id = ?;`;
    try {
        const results = await queryPromise(query, [id]);

        if (results.length === 0) {
            return null;
        }

        const hashedPassword = results[0].password_hash;
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (err) {
        console.error('DBエラー:', err);
        throw err; // エラーを呼び出し元に伝播させる
    }
};
