const sqlite3 = require('sqlite3').verbose();
const EscalaoDB = require('./Escalao');
const TorneioDB = require('./Torneio');
const EquipaDB = require('./Equipa');

class Malha {

    constructor(){
        this.db = new sqlite3.Database('./data/malha.db', (err) => {
            if(err) throw err;
            else {
                this.initEscalaoTable();
                this.initTorneioTable();
                this.initEquipasTable();
            }
        });
    }

    initEscalaoTable(){
        this.escalao = new EscalaoDB(this.db);
    }

    initTorneioTable(){
        this.torneio = new TorneioDB(this.db);
    }

    initEquipasTable(){
        this.equipa = new TorneioDB(this.db);
    }
}

module.exports = Malha;