const sqlite3 = require('sqlite3').verbose();

class Localidades {
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
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(`CREATE TABLE IF NOT EXISTS localidades (
                localidade_id INTEGER NOT NULL PRIMARY KEY,
                localidade INTEGER NOT NULL)`,
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    addLocalidade(localidade) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(
                "INSERT INTO localidades (localidade) VALUES (?)",
                [localidade],
                (err) => {
                    if(err)
                        return reject(err);
                    else
                        return resolve();
                }
            );
        });
    }

    getAllLocalidades(){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(
                "SELECT * FROM localidades ORDER BY localidade ASC",
                (err, rows) => {
                    if(err)
                        return reject(err);
                    else
                        return resolve(rows);
                }
            );
        });
    }

    getLocalidadeByID(id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(
                "SELECT * FROM localidades WHERE localidade_id = ?",
                [id],
                (err, row) => {
                    if(err)
                        return reject(err);
                    else
                        return resolve(row);
                }
            );
        });
    }

    updateLocalidade(id, localidade) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("UPDATE localidades SET localidade = ? WHERE localidade_id = ?",
                [localidade, id],
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

    deleteLocalidade(id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("DELETE FROM localidades WHERE localidade_id = ?",
                [id],
                (err) => {
                    if(err){
                        return reject(err);
                    } else {
                        return resolve();
                    }
                });
        });
    }

    close(){
        this.db.close();
    }
}

module.exports = Localidades;