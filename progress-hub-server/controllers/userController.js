const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('../config/db');
const message = require('../config/message');
const ALLOWED_FIELDS = ['user_name', 'display_name', 'icon_url'];

exports.getAllUsers = (req, res) => {
    const query = 'SELECT id, user_name, display_name, icon_url, created_at, updated_at, deleted_at FROM users WHERE deleted_at IS NULL;';
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
    const query = 'SELECT user_name, display_name, icon_url, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL;';
    const user_id = [ req.params.id ];
    connection.query(query, user_id, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: message.ERRORS.USER_DB.QUERY_ERROR
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                error: message.ERRORS.USER_DB.USER_NOT_FOUND
            });
        }
        res.json(results[0]);
    });
};

exports.createUser = async (req, res) => {
    const query = 'INSERT INTO users (user_name, display_name, password_hash, icon_url) VALUES(?, ?, ?, ?);';
    
    const params = [req.body.user_name, req.body.display_name, hashedPassword, req.body.icon_url];
    
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        connection.query(query, params, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: message.ERRORS.USER_DB.QUERY_ERROR });
            }
            res.status(201).json({
                message: message.SUCCESS.USER_DB.USER_CREATE_SUCCESS,
                userId: results.insertId
            })
        });
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
            console.error(err);
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
            message: message.SUCCESS.USER_DB.USER_UPDATE_SUCCESS
        });
    });
}

// ユーザー削除API
// URL: DELETE (/api/users/:id)
// パスワードを検証し、あっていれば削除を実行
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    const deleteQuery = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?;';

    fetchPasswordHash(userId, req.body.password, (err, match) => {
        if (err) {
            c           
            return res.status(401).json({
                error: message.ERRORS.AUTH.INVALID_CREDENTIALS
            })
        }
        if (match) {
            connection.query(deleteQuery, [userId], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: message.ERRORS.USER_DB.QUERY_ERROR
                    })
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({
                        error: message.ERRORS.USER_DB.USER_NOT_FOUND
                    });
                }
                return res.status(200).json({
                    message: message.SUCCESS.USER_DB.USER_DELETE_SUCCESS
                });
            })
        } else {
            return res.status(401).json({
                error: message.ERRORS.AUTH.INVALID_CREDENTIALS
            });
        }
    })
};

// パスワード検証メソッド
async function fetchPasswordHash(id, password, callback){
    const query = 'SELECT password_hash FROM users WHERE id = ?;';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("DBエラー:", err);
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, false);
        }

        const hashedPassword = results[0].password_hash;
        bcrypt.compare(password, haかshedPassword, (err, match) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, match);
        });
    });
};