const express = require('express');
const router = express.Router();
const faker = require('faker');
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    if(!req.session.torneio){
        malha.torneio.getActiveTorneio().then((row) => {
            if(!row) {
                req.session.torneio = null;
            } else {
                req.session.torneio = row;
            }
            next();
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
    malha.escalao.getAllEscaloes().then((rows) => {
        rows.forEach(element => {
            escaloes.push(element.escalao_id);
        });
        addTeams(req.params.num, req.session.torneio.torneio_id, localidades, escaloes);
        res.redirect('/equipas');
    });
});

async function addTeams(num, torneio, localidades, escaloes){
    var i;
    for(i = 0; i < num; i++){
        await malha.equipa.addEquipa(
            torneio,
            faker.name.firstName() + " " + faker.name.lastName(),
            faker.name.firstName() + " " + faker.name.lastName(),
            localidades[Math.floor(Math.random() * localidades.length)],
            escaloes[Math.floor(Math.random() * escaloes.length)]
        );
        console.log(i+": Equipa Adicionada");
    } 
}

router.get('/', (req, res) => {
    if(req.session.torneio != null) {
        malha.equipa.getAllEquipasByTorneio(req.session.torneio.torneio_id).then((equipas) => {
            malha.escalao.getAllEscaloes().then((escaloes) => {
                malha.equipa.getAllLocalidades(req.session.torneio.torneio_id).then((localidades) => {
                    res.render('home/equipas/index', {equipas: equipas, torneio: req.session.torneio, escaloes: escaloes, localidades: localidades});
                }).catch((err) => {
                    console.log(err);
                    res.render('home/equipas/index', {equipas: equipas, torneio: req.session.torneio, escaloes: escaloes});
                });
            }).catch((err) => {
                console.log(err);
                res.render('home/equipas/index', {equipas: rows, torneio: req.session.torneio});
            });   
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível obter as equipas');
            res.redirect('/equipas');
        });
    } else {
        console.log("Não existe torneio");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

router.get('/escalao/:id', (req, res) => {
    malha.equipa.getAllEquipasByTorneioAndEscalao(req.session.torneio.torneio_id, req.params.id).then((equipas) => {
        malha.escalao.getAllEscaloes().then((escaloes) => {
            res.render('home/equipas/index', {id: req.params.id, equipas: equipas, torneio: req.session.torneio, escaloes: escaloes});
        }).catch((err) => {
            console.log(err);
            res.render('home/equipas/index', {id: req.params.id, equipas: rows, torneio: req.session.torneio});
        });   
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter as equipas');
        res.redirect('/equipas');
    });
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
    malha.equipa.getEquipaByID(req.params.searchTeamID).then((equipa) => {
        console.log(equipa);
    });
});

module.exports = router;