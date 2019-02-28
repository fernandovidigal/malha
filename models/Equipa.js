const sqlite3 = require('sqlite3').verbose();

class Equipa {

    constructor(db = null){
        if(db == null) {
            this.db = new sqlite3.Database('./data/malha.db', (err) => {
                if(err) throw err;
                else {
                    this.createTable().catch((err) => {
                        console.log(err);
                    });
                }
            });
        } else {
            this.db = db;
            this.createTable().catch((err) => {
                console.log(err);
            });
        }
        
    }

    createTable(){
        const that = this
        return new Promise(function(resolve, reject){
            that.db.run(`CREATE TABLE IF NOT EXISTS equipa (
                equipa_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                torneio_id INTEGER NOT NULL,
                primeiro_elemento TEXT NOT NULL,
                segundo_elemento TEXT NOT NULL,
                localidade TEXT NOT NULL,
                escalao INTEGER NOT NULL)`,
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }
}

module.exports = Equipa;