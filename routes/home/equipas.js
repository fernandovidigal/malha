const express = require('express');
const router = express.Router();
const faker = require('faker');
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');

async function getEscaloesAndLocalidades(torneio_id){
    const escaloes = await malha.escalao.getAllEscaloes();
    const localidades = await malha.equipa.getAllLocalidades(torneio_id);
    return {
        escaloes: escaloes,
        localidades: localidades
    }
}

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    if(!req.session.torneio){
        malha.torneio.getActiveTorneio().then((row) => {
            if(!row) {
                req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
                res.redirect('../');
            } else {
                req.session.torneio = row;
                next();
            }
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro');
            res.redirect('/equipas');
        });
    } else {
        next();
    }
});

router.get('/faker/:num', (req, res) => {
    var escaloes = [];
    var localidades = ['Arraiolos', 'Mora', 'Évora', 'Montemor-o-novo', 'Lavre', 'Estremoz', 'Borba', 'Viana do Alentejo', 'Redondo'];

    faker.locale = "pt_BR";
    malha.escalao.getAllEscaloes()
    .then(async (rows) => {
        rows.forEach(element => {
            escaloes.push(element.escalao_id);
        });

        var i;
        for(i = 0; i < req.params.num; i++){
            await malha.equipa.addEquipa(
                req.session.torneio.torneio_id,
                faker.name.firstName() + " " + faker.name.lastName(),
                faker.name.firstName() + " " + faker.name.lastName(),
                localidades[Math.floor(Math.random() * localidades.length)],
                escaloes[Math.floor(Math.random() * escaloes.length)]
            );
            console.log(i+": Equipa Adicionada");
        } 

        return req.params.num;
    })
    .then((num)=> {
        req.flash("success", `${num} adicionadas com sucesso`);
        res.redirect('/equipas');
    });
});

router.get('/', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'torneio': req.session.torneio
        };
        malha.equipa.getAllEquipasByTorneio(req.session.torneio.torneio_id)
        .then((row) => {
            console.log();
            if(row.length > 0){
                data.equipas = row;
            }
            return getEscaloesAndLocalidades(req.session.torneio.torneio_id);
        })
        .then((rows) => {
            data.escaloes = rows.escaloes;
            data.localidades = rows.localidades;
            res.render('home/equipas/index', {data: data});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro ao aceder ao menu Equipas');
            res.redirect('../');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

router.get('/escalao/:id', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'filtro_escalao_id': req.params.id,
            'torneio': req.session.torneio
        };

        malha.equipa.getAllEquipasByTorneioAndEscalao(req.session.torneio.torneio_id, req.params.id)
        .then((equipas) => {
            console.log();
            if(equipas.length > 0){
                data.equipas = equipas;
            }
            return getEscaloesAndLocalidades(req.session.torneio.torneio_id);
        })
        .then((rows) => {
            data.escaloes = rows.escaloes;
            data.localidades = rows.localidades;
            res.render('home/equipas/index', {data: data});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro ao aceder ao menu Equipas');
            res.redirect('../');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

router.get('/adicionarEquipa', (req, res) => {
    malha.escalao.getAllEscaloes().then((rows) => {
        res.render('home/equipas/adicionarEquipa', {escaloes: rows});
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter os escalões');
        res.redirect('/equipas');
    });
});

router.post('/adicionarEquipa', (req, res) => {
    malha.equipa.addEquipa(
        req.session.torneio.torneio_id,
        req.body.primeiro_elemento,
        req.body.segundo_elemento,
        req.body.localidade,
        req.body.escalao
    ).then(() => {
        req.flash('success', 'Equipa adicionada com sucesso');
        res.redirect('/equipas');
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível adicionar a equipa');
        res.redirect('/equipas');
    });
});

router.post('/searchTeamID', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'equipa_id': req.body.searchTeamID,
            'torneio': req.session.torneio
        };
        malha.equipa.getEquipaByID(req.body.searchTeamID, req.session.torneio.torneio_id)
        .then((equipa) => {
            if(typeof image_array !== 'undefined' && equipa.length > 0){
                data.equipas = equipa;
            }
            return getEscaloesAndLocalidades(req.session.torneio.torneio_id);
        })
        .then((rows) => {
            data.escaloes = rows.escaloes;
            data.localidades = rows.localidades;
            res.render('home/equipas/index', {data: data});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro');
            res.redirect('/equipas');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

module.exports = router;