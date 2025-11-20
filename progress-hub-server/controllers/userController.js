const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('../config/db');
const message = require('../config/message');
const ALLOWED_FIELDS = ['user_name', 'display_name', 'icon_url'];

exports.getAllUsers = (req, res) => {
    const query = 'SELECT * FROM users;';
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: message.ERRORS.USER_DB.QUERY_ERROR
            });
        }
        res.json(results);
    });
};

exports.getUser = (req, res) => {
    const query = 'SELECT * FROM users WHERE id = ?;';
    const user_id = [ req.params.id ];
    connection.query(query, user_id, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: message.ERRORS.USER_DB.QUERY_ERROR
            });
        }
        res.json(results);
    });
};

exports.createUser = async (req, res) => {
    const query = 'INSERT INTO users (user_name, display_name, password_hash, icon_url) VALUES(?, ?, ?, ?);';
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const params = [req.body.user_name, req.body.display_name, hashedPassword, req.body.icon_url];
    connection.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error'});
        }
        res.status(201).json({
            message: message.SUCCESS.USER_DB.QUERY_SUCCESS,
            userId: results.userId
        })
    });
};

// ユーザー情報変更API
// URL: PATCH (/api/users/:id)
// req.bodyのキーと値を読み取り、指定のユーザー情報を変更する
exports.updateUser = (req, res) => {
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

    connection.query(query, [req.body, userId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: message.ERRORS.USER_DB.QUERY_ERROR
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                error: message.ERRORS.USER_DB.USER_NOT_FOUND
            })
        }
        res.status(200).json({
            message: message.SUCCESS.USER_DB.QUERY_SUCCESS
        });
    });
}

// ユーザー削除API
// URL: DELETE (/api/users/:id)
// パスワードを検証し、あっていれば削除を実行
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    const isPasswordMatched = await fetchPasswordHash(userId, req.body.password);
    if (!isPasswordMatched) {
        return res.status(401).json({
            error: message.ERRORS.AUTH.INVALID_CREDENTIALS
        });
    }

    const deleteQuery = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?;';
    const deleteResult = await connection.query(deleteQuery, [userId]);

    if (deleteResult.affectedRows === 0) {
        return res.status(404).json({
            error: message.ERRORS.USER_DB.USER_NOT_FOUND
        });
    }
    return res.status(200).json({
        message: message.SUCCESS.USER_DB.USER_DELETE_SUCCESS
    })
};

// パスワード検証メソッド
async function fetchPasswordHash(id, password){
    const query = 'SELECT password_hash FROM users WHERE id = ?;';
    try {
        const results = await connection.query(query, [id]);

        if (results.length === 0) {
            return null;
        }
        const hashedPassword = results[0][0].password_hash;
        const match = await bcrypt.compare(password, hashedPassword);

        return match;
    } catch (err) {
        console.error("DBエラー:", err);
    }
};