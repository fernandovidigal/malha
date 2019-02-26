const express = require('express');
const router = express.Router();
const MalhaDB = require('../../models/Malha');
const malha = new MalhaDB();
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    res.render('home/equipas/index');
});

router.get('/adicionarEquipa', (req, res) => {
    malha.escalao.getAllEscaloes().then((rows) => {
        console.log(rows);
        res.render('home/equipas/adicionarEquipa', {escaloes: rows});
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter os escalões');
        req.redirect('/equipas');
    });
});

module.exports = router;