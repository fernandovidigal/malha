const sqlite3 = require('sqlite3').verbose();
const EscalaoDB = require('./Escalao');

class Malha {

    constructor(){
        this.db = new sqlite3.Database('./data/malha.db', (err) => {
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

    createTables(){
        this.escalao = new EscalaoDB(this.db);
    }
}

module.exports = Malha;