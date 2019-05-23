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

    addParciais(jogo_id, data){
        const that = this;
        const parciaisData = data.parciaisData;
        
        return new Promise(function(resolve, reject){
            that.db.run('BEGIN TRANSACTION');
            that.db.run(`INSERT INTO parciais (jogo_id, equipa_id, parcial1, parcial2, parcial3) VALUES (?,?,?,?,?)`, [jogo_id, parciaisData.equipa1.equipa_id, parciaisData.equipa1.parcial1, parciaisData.equipa1.parcial2, parciaisData.equipa1.parcial3], (err) => {
                if(err) {
                    that.db.run('ROLLBACK');
                    return reject(err);
                }
            });
            that.db.run(`INSERT INTO parciais (jogo_id, equipa_id, parcial1, parcial2, parcial3) VALUES (?,?,?,?,?)`, [jogo_id, parciaisData.equipa2.equipa_id, parciaisData.equipa2.parcial1, parciaisData.equipa2.parcial2, parciaisData.equipa2.parcial3], (err) => {
                if(err) {
                    that.db.run('ROLLBACK');
                    return reject(err);
                }
            });
            that.db.run('UPDATE jogos SET equipa1_pontos = ?, equipa2_pontos = ? WHERE jogo_id = ? AND equipa1_id = ? AND equipa2_id = ?',
                        [parciaisData.equipa1.pontos, parciaisData.equipa2.pontos, jogo_id, parciaisData.equipa1.equipa_id, parciaisData.equipa2.equipa_id], (err) => {
                if(err) {
                    that.db.run('ROLLBACK');
                    return reject(err);
                } else {
                    that.db.run('COMMIT');
                    return resolve();
                }
            });
        });
    }

    updateParciais(jogo_id, data){
        const that = this;
        const parciaisData = data.parciaisData;
        
        return new Promise(function(resolve, reject){
            that.db.run('BEGIN');
            that.db.run(`UPDATE parciais SET parcial1 = ?, parcial2 = ?, parcial3 = ? WHERE jogo_id = ? AND equipa1_id = ?`,
                [parciaisData.equipa1.parcial1, parciaisData.equipa1.parcial2, parciaisData.equipa1.parcial3, jogo_id, parciaisData.equipa1.equipa_id],
                (err) => {
                    if(err) {
                        that.db.run('ROLLBACK');
                        return reject(err);
                    }
                });
            that.db.run(`UPDATE parciais SET parcial1 = ?, parcial2 = ?, parcial3 = ? WHERE jogo_id = ? AND equipa1_id = ?`,
                [parciaisData.equipa2.parcial1, parciaisData.equipa2.parcial2, parciaisData.equipa2.parcial3, jogo_id, parciaisData.equipa2.equipa_id],
                (err) => {
                    if(err) {
                        that.db.run('ROLLBACK');
                        return reject(err);
                    }
                });
            that.db.run('UPDATE jogos SET equipa1_pontos = ?, equipa2_pontos = ? WHERE jogo_id = ? AND equipa1_id = ? AND equipa2_id = ?',
                        [parciaisData.equipa1.pontos, parciaisData.equipa2.pontos, jogo_id, parciaisData.equipa1.equipa_id, parciaisData.equipa2.equipa_id], (err) => {
                if(err) {
                    that.db.run('ROLLBACK');
                    return reject(err);
                } else {
                    that.db.run('COMMIT');
                    return resolve();
                }
            });
        });
    }

    getFaseTorneioPorEscalao(torneio_id, escalao_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
                SELECT fase 
                FROM jogos 
                WHERE torneio_id = ? AND escalao_id = ?
                GROUP BY fase
                ORDER BY fase DESC
            `,
            [torneio_id, escalao_id],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    getEscaloesPorSexo(torneio_id, sexo){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`
                SELECT jogos.escalao_id, escaloes.designacao 
                FROM jogos
                INNER JOIN escaloes
                ON escaloes.escalao_id = jogos.escalao_id
                WHERE jogos.torneio_id = ? AND escaloes.sexo = ?
                GROUP BY jogos.escalao_id
            `,
            [torneio_id, sexo],
            (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
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

    getNumeroCamposPorFase(torneio_id, escalao_id, fase){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
                SELECT MAX(campo) as numCampos 
                FROM jogos 
                WHERE torneio_id = ? AND escalao_id = ? AND fase = ?
                GROUP BY escalao_id
            `,
            [torneio_id, escalao_id, fase],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    getNumeroJogos(torneio_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
                SELECT COUNT(jogo_id) AS count
                FROM jogos 
                WHERE torneio_id = ?
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

    getEquipasPorJogo(jogo_id){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
                SELECT equipa1_id, equipa2_id
                FROM jogos 
                WHERE jogo_id = ?
            `,
            [jogo_id],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    getNumeroEquipasPorEscalao(torneio_id, escalao_id, fase){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
            SELECT COUNT(DISTINCT tabela.equipa) as numEquipas
            FROM (
                SELECT equipa1_id AS equipa FROM jogos WHERE torneio_id = ? AND escalao_id = ? AND fase = ?
                UNION ALL
                SELECT equipa2_id AS equipa FROM jogos WHERE torneio_id = ? AND escalao_id = ? AND fase = ?
            ) as tabela
            `,
            [torneio_id, escalao_id, fase, torneio_id, escalao_id, fase],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    getNumeroJogosPorEscalao(torneio_id, escalao_id, fase){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.get(`
            SELECT COUNT(jogo_id) as numJogos
            FROM jogos
            WHERE torneio_id = ? AND escalao_id = ? AND fase = ?
            `,
            [torneio_id, escalao_id, fase],
            (err, row) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(row);
                }
            });
        });
    }

    getTodasEquipasSemParciaisPorCampo(torneio_id, escalao_id, campo){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`
            SELECT jogos.*, equipa1Info.primeiro_elemento AS equipa1_primeiro_elemento, equipa1Info.segundo_elemento AS equipa1_segundo_elemento, equipa1Info.localidade AS equipa1_localidade, 
            equipa2Info.primeiro_elemento AS equipa2_primeiro_elemento, equipa2Info.segundo_elemento AS equipa2_segundo_elemento, equipa2Info.localidade AS equipa2_localidade
            FROM jogos
            INNER JOIN (
                SELECT equipas.equipa_id, equipas.primeiro_elemento, equipas.segundo_elemento, localidades.localidade
                FROM equipas
                INNER JOIN localidades
                ON equipas.localidade_id = localidades.localidade_id
            ) AS equipa1Info
            ON jogos.equipa1_id = equipa1Info.equipa_id
            INNER JOIN (
                SELECT equipas.equipa_id, equipas.primeiro_elemento, equipas.segundo_elemento, localidades.localidade
                FROM equipas
                INNER JOIN localidades
                ON equipas.localidade_id = localidades.localidade_id
            ) AS equipa2Info
            ON jogos.equipa2_id = equipa2Info.equipa_id
            WHERE jogos.torneio_id = ? AND jogos.escalao_id = ? AND jogos.campo = ? AND jogos.jogo_id NOT IN (
                SELECT jogo_id
                FROM parciais
            )
            `,
            [torneio_id, escalao_id, campo],
            (err, rows) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rows);
                }
            });
        });
    }

    getTodasEquipasComParciaisPorCampo(torneio_id, escalao_id, campo){
        const that = this;
        return new Promise(function(resolve, reject){
            that.db.all(`
            SELECT jogos.*, equipa1Info.primeiro_elemento AS equipa1_primeiro_elemento, equipa1Info.segundo_elemento AS equipa1_segundo_elemento, equipa1Info.localidade AS equipa1_localidade, 
			equipa1Parciais.parcial1 AS equipa1_parcial1, equipa1Parciais.parcial2 AS equipa1_parcial2, equipa1Parciais.parcial3 AS equipa1_parcial3,
            equipa2Info.primeiro_elemento AS equipa2_primeiro_elemento, equipa2Info.segundo_elemento AS equipa2_segundo_elemento, equipa2Info.localidade AS equipa2_localidade,
			equipa2Parciais.parcial1 AS equipa2_parcial1, equipa2Parciais.parcial2 AS equipa2_parcial2, equipa2Parciais.parcial3 AS equipa2_parcial3
            FROM jogos
            INNER JOIN (
                SELECT equipas.equipa_id, equipas.primeiro_elemento, equipas.segundo_elemento, localidades.localidade
                FROM equipas
                INNER JOIN localidades
                ON equipas.localidade_id = localidades.localidade_id
            ) AS equipa1Info
            ON jogos.equipa1_id = equipa1Info.equipa_id
            INNER JOIN (
                SELECT equipas.equipa_id, equipas.primeiro_elemento, equipas.segundo_elemento, localidades.localidade
                FROM equipas
                INNER JOIN localidades
                ON equipas.localidade_id = localidades.localidade_id
            ) AS equipa2Info
            ON jogos.equipa2_id = equipa2Info.equipa_id
			INNER JOIN parciais AS equipa1Parciais
			ON jogos.equipa1_id = equipa1Parciais.equipa_id AND jogos.jogo_id = equipa1Parciais.jogo_id
			INNER JOIN parciais AS equipa2Parciais
			ON jogos.equipa2_id = equipa2Parciais.equipa_id AND jogos.jogo_id = equipa2Parciais.jogo_id
            WHERE jogos.torneio_id = ? AND jogos.escalao_id = ? AND jogos.campo = ? AND jogos.jogo_id IN (
                SELECT jogo_id
                FROM parciais
            )
            `,
            [torneio_id, escalao_id, campo],
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