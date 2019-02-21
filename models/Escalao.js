const sqlite3 = require('sqlite3').verbose();

class Malha {

    constructor(){
        this.db = new sqlite3.Database('./data/malha.db', (err) => {
            if(err) throw err;
            else {
                this.createTable().catch((err) => {
                    console.log(err);
                });
            }
        });
    }

    createTable(){
        const that = this
        return new Promise(function(resolve, reject){
            that.db.run(`CREATE TABLE IF NOT EXISTS escalao (
                escalao_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                sexo INT NOT NULL,
                designacao TEXT NOT NULL)`, 
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    addEscalao(designacao, sexo) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(
                "INSERT INTO escalao (sexo, designacao) VALUES (?,?)",
                [sexo, designacao],
                (err) => {
                    if(err)
                        return reject(err);
                    else
                        return resolve();
                }
            );
        });
    }
}

module.exports = Malha;