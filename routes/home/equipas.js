const express = require('express');
const router = express.Router();
/*const MalhaDB = require('../../models/Malha');
const malha = new MalhaDB();*/
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    if(!req.session.torneio){
        malha.torneio.getActiveTorneio().then((row) => {
            req.session.torneio = row;
            next();
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro');
            req.redirect('/equipas');
        });;
    } else {
        next();
    }
});

router.get('/', (req, res) => {
    malha.equipa.getAllEquipasByTorneio(req.session.torneio.torneio_id).then((rows) => {
        res.render('home/equipas/index', {equipas: rows, torneio: req.session.torneio});
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter as equipas');
        req.redirect('/equipas');
    });
});

router.get('/adicionarEquipa', (req, res) => {
    malha.escalao.getAllEscaloes().then((rows) => {
        res.render('home/equipas/adicionarEquipa', {escaloes: rows});
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter os escalões');
        req.redirect('/equipas');
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

module.exports = router;