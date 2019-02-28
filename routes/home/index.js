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
            req.redirect('/');
        });;
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