const sqlite3 = require('sqlite3').verbose();
const EscaloesDB = require('./Escaloes');
const TorneiosDB = require('./Torneios');
const LocalidadesDB = require('./Localidades');
const EquipasDB = require('./Equipas');
const JogosDB = require('./Jogos');

class Malha {

    constructor(){   
        this.db = new sqlite3.Database('./data/malha.db', (err) => {
            if(err) throw err;
            else {
                this.initEscaloesTable();
                this.initTorneiosTable();
                this.initLocalidadesTable();
                this.initEquipasTable();
                this.initJogosTables();
            }
        });
    }

    initEscaloesTable(){
        this.escaloes = new EscaloesDB(this.db);
    }

    initTorneiosTable(){
        this.torneios = new TorneiosDB(this.db);
    }

    initLocalidadesTable(){
        this.localidades = new LocalidadesDB(this.db);
    }

    initEquipasTable(){
        this.equipas = new EquipasDB(this.db);
    }

    initJogosTables(){
        this.jogos = new JogosDB(this.db);
    }

    close(){
        this.db.close();
    }
}

module.exports = Malha;