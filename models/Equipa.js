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
                escalao_id INTEGER NOT NULL)`,
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    addEquipa(torneio_id, primeiroElemento, segundoElemento, localidade, escalao_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(
                `INSERT INTO equipa (equipa_id, torneio_id, primeiro_elemento, segundo_elemento, localidade, escalao_id) 
                VALUES (
                    (SELECT
                        CASE 
		                    WHEN MAX(equipa_id) IS NULL
		                    THEN 1
		                    ELSE (MAX(equipa_id) + 1)
	                    END lastID
                    FROM equipa WHERE torneio_id = ? 
                    )
                    ,?,?,?,?,?)`,
                [torneio_id, torneio_id, primeiroElemento, segundoElemento, localidade, escalao_id],
                (err) => {
                    if(err)
                        return reject(err);
                    else{
                        return resolve();
                    }
                }
            );
        });
    }

    getAllEquipasByTorneio(torneio_id) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`
                SELECT equipa.*, escalao.designacao, escalao.sexo 
                FROM equipa 
                INNER JOIN escalao 
                ON escalao.escalao_id = equipa.escalao_id
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

    getAllEquipasByTorneioAndEscalao(torneio_id, escalao_id) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`
                SELECT equipa.*, escalao.designacao, escalao.sexo 
                FROM equipa 
                INNER JOIN escalao 
                ON escalao.escalao_id = equipa.escalao_id
                WHERE equipa.torneio_id = ? AND equipa.escalao_id = ? 
                ORDER BY equipa.equipa_id ASC`,
            [torneio_id, escalao_id],
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

    getEquipaByID(id, torneio_id) {
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
                SELECT equipa.*, escalao.designacao, escalao.sexo 
                FROM equipa 
                INNER JOIN escalao 
                ON escalao.escalao_id = equipa.escalao_id
                WHERE equipa.equipa_id = ? AND equipa.torneio_id = ?`,
            [id, torneio_id],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    // Se a equipa não existem (undefined) retorna um array vazio
                    return resolve((row != undefined ? [row] : []));
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

    getTeamsByTorneioAndLocalidade(torneio_id, localidade){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`SELECT equipa.*, escalao.designacao, escalao.sexo 
            FROM equipa 
            INNER JOIN escalao 
            ON escalao.escalao_id = equipa.escalao_id
            WHERE equipa.localidade = ? AND equipa.torneio_id = ?
            ORDER BY equipa.equipa_id ASC`,
            [localidade, torneio_id],
            (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            });
        });
    }

    getTeamsByTorneioAndLocalidadeAndEscalao(torneio_id, localidade, escalao_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`SELECT equipa.*, escalao.designacao, escalao.sexo 
            FROM equipa 
            INNER JOIN escalao 
            ON escalao.escalao_id = equipa.escalao_id
            WHERE equipa.localidade = ? AND equipa.torneio_id = ? AND equipa.escalao_id = ?
            ORDER BY equipa.equipa_id ASC`,
            [localidade, torneio_id, escalao_id],
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