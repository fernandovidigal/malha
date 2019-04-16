const sqlite3 = require('sqlite3').verbose();

class Jogos {

    constructor(db = null){
        if(db == null) {
            this.db = new sqlite3.Database('./data/malha.db', (err) => {
                if(err) throw err;
                else {
                    this.initTables();
                }
            });
        } else {
            this.db = db;
            this.initTables();
        }
        
    }

    initTables(){
        this.createJogosTable().then(()=>{
            return this.createParciaisTable();
        }).catch((err) => {
            console.log(err);
        });
    }

    createJogosTable(){
        const that = this
        return new Promise(function(resolve, reject){
            that.db.run(`CREATE TABLE IF NOT EXISTS jogos (
                jogo_id INTEGER NOT NULL PRIMARY KEY,
                torneio_id INTEGER NOT NULL,
                escalao_id INTEGER NOT NULL,
                fase INTEGER NOT NULL,
                campo INTEGER NOT NULL,
                equipa1_id INTEGER NOT NULL,
                equipa2_id INTEGER NOT NULL,
                equipa1_pontos INTEGER NOT NULL DEFAULT 0,
                equipa2_pontos INTEGER NOT NULL DEFAULT 0)`, 
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    createParciaisTable(){
        const that = this
        return new Promise(function(resolve, reject){
            that.db.run(`CREATE TABLE IF NOT EXISTS parciais (
                parcial_id INTEGER NOT NULL PRIMARY KEY,
                jogo_id INTEGER NOT NULL,
                equipa_id INTEGER NOT NULL,
                parcial1 INTEGER NOT NULL DEFAULT 0,
                parcial2 INTEGER NOT NULL DEFAULT 0,
                parcial3 INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (jogo_id) REFERENCES jogos(jogo_id)
                    ON DELETE CASCADE,
                FOREIGN KEY (equipa_id) REFERENCES jogos(equipa1_id)
                    ON DELETE CASCADE,
                FOREIGN KEY (equipa_id) REFERENCES jogos(equipa2_id)
                    ON DELETE CASCADE
                )`, 
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    addJogo(torneio_id, escalao_id, fase, campo, equipa1_id, equipa2_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.run(`
                INSERT INTO jogos (torneio_id, escalao_id, fase, campo, equipa1_id, equipa2_id)
                VALUES (?,?,?,?,?,?)
            `,
            [torneio_id, escalao_id, fase, campo, equipa1_id, equipa2_id],
            (err) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    getFaseTorneio(torneio_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
                SELECT fase 
                FROM jogos 
                WHERE torneio_id = ?
                GROUP BY fase
                ORDER BY fase DESC
            `,
            [torneio_id],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    getNumJogosPorFase(torneio_id, fase){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
                SELECT COUNT(jogo_id) AS numJogos 
                FROM jogos 
                WHERE torneio_id = ? AND fase = ?
            `,
            [torneio_id, fase],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    getCampos(torneio_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`
                SELECT campo 
                FROM jogos 
                WHERE torneio_id = ?
                GROUP BY campo
                ORDER BY campo ASC
            `,
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

module.exports = Jogos;