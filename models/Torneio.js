const sqlite3 = require('sqlite3').verbose();

class Torneio {

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
            that.db.run(`CREATE TABLE IF NOT EXISTS torneio (
                torneio_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                designacao TEXT NOT NULL,
                localidade TEXT NOT NULL,
                ano INTEGER NOT NULL)`, 
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    getAllTorneios(){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all("SELECT * FROM torneio", (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            })
        });
    }

    getTorneioById(id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT * FROM torneio WHERE torneio_id = ? LIMIT 1",
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

    addTorneio(designacao, localidade, ano) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(
                "INSERT INTO torneio (designacao, localidade, ano) VALUES (?,?,?)",
                [designacao, localidade, ano],
                (err) => {
                    if(err)
                        return reject(err);
                    else
                        return resolve();
                }
            );
        });
    }

    updateTorneio(id, designacao, localidade, ano) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("UPDATE torneio SET designacao = ?, localidade = ?, ano = ? WHERE torneio_id = ?",
                [designacao, localidade, ano, id],
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

    deleteTorneio(id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("DELETE FROM torneio WHERE torneio_id = ?", [id], (err) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve();
                }
            })
        });
    }
}

module.exports = Torneio;