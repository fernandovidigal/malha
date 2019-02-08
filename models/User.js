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
    }

    createUsersTable(){
        this.db.serialize(() => {
            // Cria a tabelas de utilizadores
            this.db.run(`CREATE TABLE users (
                user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                status INTEGER NOT NULL DEFAULT 0
            )`);

            // Adiciona um utilizador por default com privilegios de administrador
            this.addUser('admin', '12345', 10);
        });
    }

    addUser(nome, password, status = 0) {
        var stmt = this.db.prepare("INSERT INTO users (username, password, status) VALUES (?,?,?)");
        stmt.run(this.encrypt(nome), this.encrypt(password), status);
        stmt.finalize();
    }

    deleteUser(user_id){
        var stmt = this.db.prepare("DELETE FROM users WHERE user_id = ? LIMIT 1");
        stmt.run(user_id);
        stmt.finalize();
    }

    lookupUser(username, password) {
        var stmt = this.db.prepare("SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1");
        stmt.get(this.encrypt(username), this.encrypt(password), (err, row) => {
            console.log(row);
        });
        stmt.finalize();
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