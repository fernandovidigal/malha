const sqlite3 = require('sqlite3').verbose();

class Escaloes {

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
            that.db.run(`
                CREATE TABLE IF NOT EXISTS escaloes (
                escalao_id INTEGER NOT NULL PRIMARY KEY,
                designacao TEXT NOT NULL,
                sexo INTEGER NOT NULL)`, 
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
            that.db.all("SELECT * FROM escaloes", (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            })
        });
    }

    getEscalaoById(id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT * FROM escaloes WHERE escalao_id = ? LIMIT 1",
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

    getAllEscaloesBySex(sexo){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all("SELECT * FROM escaloes WHERE sexo = ?", [sexo], (err, rows) => {
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
                "INSERT INTO escaloes (designacao, sexo) VALUES (?,?)",
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

    updateEscalao(id, designacao, sexo) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("UPDATE escaloes SET designacao = ?, sexo = ? WHERE escalao_id = ?",
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
            that.db.run("DELETE FROM escaloes WHERE escalao_id = ?", [id], (err) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve();
                }
            })
        });
    }
}

module.exports = Escaloes;