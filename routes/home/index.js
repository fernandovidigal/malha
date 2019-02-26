const express = require('express');
const router = express.Router();
const UserDB = require('../../models/User');
const user = new UserDB();
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    res.render('home/index');
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

router.get('/listaequipas', (req, res) => {
    res.send('Lista de Equipas');
});

module.exports = router;