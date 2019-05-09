const sqlite3 = require('sqlite3').verbose();

class Torneios {

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
            that.db.run(`CREATE TABLE IF NOT EXISTS torneios (
                torneio_id INTEGER NOT NULL PRIMARY KEY,
                designacao TEXT NOT NULL,
                localidade TEXT NOT NULL,
                ano INTEGER NOT NULL,
                campos INTEGER NOT NULL DEFAULT 0,s
                activo INTEGER NOT NULL DEFAULT 0)`, 
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
            that.db.all("SELECT * FROM torneios", (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            })
        });
    }

    getTorneioById(torneio_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT * FROM torneios WHERE torneio_id = ? LIMIT 1",
            [torneio_id],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            })
        });
    }

    addTorneio(designacao, localidade, ano, campos = 0) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(
                "INSERT INTO torneios (designacao, localidade, ano, campos) VALUES (?,?,?,?)",
                [designacao, localidade, ano, campos],
                function(err){
                    if(err)
                        return reject(err);
                    else{
                        return resolve(this.lastID);
                    }
                }
            );
        });
    }

    updateTorneio(torneio_id, designacao, localidade, ano, campos) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("UPDATE torneios SET designacao = ?, localidade = ?, ano = ?, campos = ? WHERE torneio_id = ?",
                [designacao, localidade, ano, campos, torneio_id],
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
            that.db.run("DELETE FROM torneios WHERE torneio_id = ?", [id], (err) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve();
                }
            })
        });
    }

    resetActiveTorneios(){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("UPDATE torneios SET activo = 0", (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    getActiveTorneio(){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT * FROM torneios WHERE activo = 1", (err, row) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    setActiveTorneio(torneio_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.resetActiveTorneios().then(()=>{
                that.db.run("UPDATE torneios SET activo = 1 WHERE torneio_id = ?",
                [torneio_id],
                (err) => {
                    if(err){
                        return reject(err);
                    } else {
                        return resolve();
                    }
                });
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    getNumTorneios(){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT COUNT(torneio_id) AS numTorneios FROM torneios", (err, row) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve(row.numTorneios);
                }
            });
        });
    }

    setNumCampos(torneio_id, campos){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run("UPDATE torneios SET campos = ? WHERE torneio_id = ?",
            [campos, torneio_id],
            (err) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    getNumCampos(torneio_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT campos AS count FROM torneios WHERE torneio_id = ?",
            [torneio_id],
            (err, row) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    /*getFase(torneio_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT fase FROM torneios WHERE torneio_id = ?",
            [torneio_id],
            (err, row) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }*/

    close(){
        this.db.close();
    }
}

module.exports = Torneios;