// ERRO DA CONSTRAINT UNIQUE
// { [Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: users.username] errno: 19, code: 'SQLITE_CONSTRAINT' }

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs =  require('fs');

class User {
    constructor(){  
        this.db = new sqlite3.Database('./data/users.db', (err) => {
            if(err) throw err;
            else {
                this.createUsersTable().then(()=>{
                    this.verifyDefaultUsers();
                }).catch((err) => {
                    console.log(err);
                });
            }
        });
    }

    createUsersTable(){
        const that = this
        return new Promise(function(resolve, reject){
            that.db.run(`CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                status INTEGER NOT NULL DEFAULT 0)`,
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    verifyDefaultUsers(){
        // Verifica se a conta de administrador existe
        this.getUser('admin').then((row) => {
            if(!row){
                // Adiciona um utilizador por default com privilegios de administrador
                this.addUser('admin', '12345', 1);
            }
        });
    }

    addUser(username, password, status = 0) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(
                "INSERT INTO users (username, password, status) VALUES (?,?,?)",
                [username, that.encrypt(password), status],
                (err) => {
                    if(err)
                        return reject(err);
                    else
                        return resolve();
                }
            );
        });
    }

    deleteUser(user_id){
        var stmt = this.db.prepare("DELETE FROM users WHERE user_id = ? LIMIT 1");
        stmt.run(user_id);
        stmt.finalize();
    }

    getUser(username) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT * FROM users WHERE username = ? LIMIT 1", [username], (err,row) => {
                if(err) 
                    reject(err);
                else {
                    //console.log('devolver row');
                    resolve(row);
                }
            });
        });
    }

    getUserById(id) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT * FROM users WHERE user_id = ? LIMIT 1", [id], (err,row) => {
                if(err) 
                    reject(err);
                else {
                    resolve(row);
                }
            });
        });
    }

    getAllUsers(){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all("SELECT * FROM users", (err,rows) => {
                if(err) {
                    return reject(err);
                }   
                else {
                    return resolve(rows);
                }
            });
        });
    }

    updateUser(id, username, password, status = 0) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("UPDATE users SET username = ?, password = ?, status = ? WHERE user_id = ?",
            [username, that.encrypt(password), status, id], (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    deleteUser(id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("DELETE FROM users WHERE user_id = ?", [id], (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    encrypt(word){
        var salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(word, salt);
    }

    close(){
        this.db.close();
    }
}

module.exports = User;