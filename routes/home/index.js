const express = require('express');
const router = express.Router();
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    if(!req.session.torneio){
        malha.torneios.getActiveTorneio().then((row) => {
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

router.get('/', (req, res) => {
    res.render('home/index');
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;