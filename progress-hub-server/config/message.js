module.exports = {
    SUCCESS: {
        USER_DB: {
            USER_CREATE_SUCCESS: 'ユーザーを作成しました。',
            USER_UPDATE_SUCCESS: 'ユーザー情報を更新しました。',
            USER_DELETE_SUCCESS: 'ユーザーを削除しました。',
        },
        TODO_DB: {
            TODO_CREATE_SUCCESS: 'ToDoを作成しました。',
            TODO_DELETE_SUCCESS: 'ToDoを削除しました。',
        },
    },
    ERRORS: {
        ERROR: {
            REQUEST_ERROR: 'リクエストの処理中にエラーが発生しました。',
        },
        USER_DB: {
            USER_NOT_FOUND: '指定されたユーザーが見つかりません。',
            QUERY_ERROR: '処理の実行中にエラーが発生しました。',
        },
        UPDATE_USER: {
            INVALID_FIELD_COUNT: '更新項目の数が不正です。',
            FIELD_NOT_ALLOWED: 'その項目の更新は許可されていません。',
            FIELD_NOT_FOUND: 'その項目は存在しません。',
        },
        AUTH: {
            INVALID_CREDENTIALS: '認証情報が無効です。',
        },
        TODO_DB: {
            TODO_NOT_FOUND: '指定されたToDoが見つかりません。',
        },
        CREATE_TODO: {
            INVALID_FIELD_COUNT: 'カラムの数が不正です。',
            FIELD_NOT_ALLOWED: 'カラム名が不正です。',
        }
    }
}
