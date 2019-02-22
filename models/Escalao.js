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
                designacao TEXT NOT NULL,
                sexo INT NOT NULL)`, 
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    getAllEscaloes(){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all("SELECT * FROM escalao", (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            })
        });
    }

    getAllEscaloesBySex(sexo){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all("SELECT * FROM escalao WHERE sexo = ?", [sexo], (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            })
        });
    }

    addEscalao(designacao, sexo) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(
                "INSERT INTO escalao (designacao, sexo) VALUES (?,?)",
                [designacao, sexo],
                (err) => {
                    if(err)
                        return reject(err);
                    else
                        return resolve();
                }
            );
        });
    }
    
    getEscalaoById(id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT * FROM escalao WHERE escalao_id = ? LIMIT 1",
            [id],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            })
        });
    }

    updateEscalao(id, designacao, sexo) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("UPDATE escalao SET designacao = ?, sexo = ? WHERE escalao_id = ?",
                [designacao, sexo, id],
                (err) => {
                    if(err){
                        return reject(err);
                    } else {
                        return resolve();
                    }
                }
            );
        });
    }

    deleteEscalao(id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("DELETE FROM escalao WHERE escalao_id = ?", [id], (err) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve();
                }
            })
        });
    }
}

module.exports = Malha;