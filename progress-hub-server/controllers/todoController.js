const express = require('express');
const lodash = require('lodash');
const connection = require('../config/db');
const message = require('../config/message');
const util = require('util');
const ALLOWED_FIELDS = [
    'user_id',
    'title',
    'detail',
    'deadline',
    'state',
    'important',
    'progress_rate',
    'category_id'
];

const queryPromise = util.promisify(connection.query).bind(connection);

exports.getTodoByUserId = async (req, res) => {
};

exports.createTodo = async (req, res) => {
    const createQuery = `
        INSERT INTO
            todos (
                user_id,
                title,
                detail,
                deadline,
                state,
                important,
                progress_rate,
                category_id,
                created_at
            )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, now()    
        );
    `;

    const user_id = req.body.user_id;
    const incomingKeys = Object.keys(req.body);

    if (incomingKeys.length !== 8) {
        return res.status(403).json({
            error: message.ERRORS.CREATE_TODO.INVALID_FIELD_COUNT
        })
    }

    if (!lodash.isEqual(lodash.countBy(ALLOWED_FIELDS), lodash.countBy(incomingKeys))) {
        return res.status(403).json({
            error: message.ERRORS.CREATE_TODO.FIELD_NOT_ALLOWED
        })
    }

    const params = [
        user_id,
        req.body.title,
        req.body.detail,
        req.body.deadline,
        req.body.state,
        req.body.important,
        req.body.progress_rate,
        req.body.category_id
    ];

    try {
        if (!await fetchUser(user_id)) {
            return res.status(401).json({
                error: message.ERRORS.USER_DB.USER_NOT_FOUND
            })
        }

        const results = await queryPromise(createQuery, params);
        
        res.status(201).json({
            message: message.SUCCESS.TODO_DB.TODO_CREATE_SUCCESS,
            todoId: results.insertId
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: message.ERRORS.ERROR.REQUEST_ERROR
        });
    }
};
exports.updateTodo = async (req, res) => {

};
exports.deleteTodo = async (req, res) => {
    
};

async function fetchUser(user_id) {
    const fetchUserQuery = 'SELECT user_id FROM users WHERE user_id = ?;';
    const results = await queryPromise(fetchUserQuery, [ user_id ]);
    return results.length > 0;
}