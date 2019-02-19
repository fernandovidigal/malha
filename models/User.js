const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs =  require('fs');

class User {
    constructor(){

        if(!fs.existsSync('./data/users.db')){
            this.db = new sqlite3.Database('./data/users.db', (err) => {
                if(err) throw err;
                this.createUsersTable();
            });
        } else {
            this.db = new sqlite3.Database('./data/users.db', (err) => {
                if(err) throw err;
            });
        }

        // Verifica Utilizadores padrão
        this.verifyDefaultUsers();

    }

    createUsersTable(){
        this.db.serialize(() => {
            // Cria a tabelas de utilizadores
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                status INTEGER NOT NULL DEFAULT 0
            )`);
        });
    }

    verifyDefaultUsers(){
        // Verifica se a conta de administrador existe
        this.getUser('admin').then((row) => {
            console.log('TEste: ' + row.length);
        });
        // Adiciona um utilizador por default com privilegios de administrador
        //this.addUser('admin', '12345', 10);
    }

    addUser(nome, password, status = 0) {
        var stmt = this.db.prepare("INSERT INTO users (username, password, status) VALUES (?,?,?)");
        stmt.run(nome, this.encrypt(password), status);
        stmt.finalize();
    }

    deleteUser(user_id){
        var stmt = this.db.prepare("DELETE FROM users WHERE user_id = ? LIMIT 1");
        stmt.run(user_id);
        stmt.finalize();
    }

    getUser(username) {
        var that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT * FROM users WHERE username = ? LIMIT 1", [username], (err,row) => {
                if(err) 
                    reject(err);
                else {
                    console.log('devolver row');
                    resolve(row);
                }
            });
        });
    }

    getUserById(id) {
        var that = this;
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

    encrypt(word){
        var salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(word, salt);
    }

    close(){
        this.db.close();
    }
}

module.exports = User;