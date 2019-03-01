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
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(`CREATE TABLE IF NOT EXISTS equipa (
                equipa_id INTEGER NOT NULL PRIMARY KEY,
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

    addEquipa(torneio_id, primeiroElemento, segundoElemento, localidade, escalao){
        const that = this;
        return new Promise(function(resolve, reject){
            that.getLastTeamIDFromTorneio(torneio_id).then((row) => {
                let lastID = 0;
                if(row != null) {
                    lastID = row.lastID;
                }
                that.db.run(
                    "INSERT INTO equipa (equipa_id, torneio_id, primeiro_elemento, segundo_elemento, localidade, escalao) VALUES (?,?,?,?,?,?)",
                    [lastID+1, torneio_id, primeiroElemento, segundoElemento, localidade, escalao],
                    (err) => {
                        if(err)
                            return reject(err);
                        else{
                            return resolve();
                        }
                    }
                );
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    getAllEquipasByTorneio(torneio_id) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`
                SELECT equipa.*, escalao.designacao, escalao.sexo 
                FROM equipa 
                INNER JOIN escalao 
                ON equipa.escalao = escalao.escalao_id 
                WHERE equipa.torneio_id = ? 
                ORDER BY equipa.equipa_id ASC`,
            [torneio_id],
            (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            });
        });
    }

    getAllEquipasByTorneioAndEscalao(torneio_id, escalao) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`
                SELECT equipa.*, escalao.designacao, escalao.sexo 
                FROM equipa 
                INNER JOIN escalao 
                ON equipa.escalao = escalao.escalao_id 
                WHERE equipa.torneio_id = ? AND equipa.escalao = ? 
                ORDER BY equipa.equipa_id ASC`,
            [torneio_id, escalao],
            (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            });
        });
    }

    getLastTeamIDFromTorneio(torneio_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get("SELECT MAX(equipa_id) as lastID FROM equipa WHERE torneio_id = ?", [torneio_id], (err,row) => {
                if(err){
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    getAllLocalidades(torneio_id) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all("SELECT localidade FROM equipa WHERE torneio_id = ? GROUP BY localidade ORDER BY localidade ASC",
            [torneio_id],
            (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            });
        });
    }
}

module.exports = Equipa;