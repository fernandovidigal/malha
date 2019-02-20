const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
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

router.get('/query', (req, res) => {
    user.getUser('admin').then((user) => {
        console.log(user.user_id);
        console.log(user.username);
        console.log(user.password);
        console.log(user.status);
    }).catch((err) => {
        console.log(err);
    });
    res.render('home/index');
});

router.get('/registo', (req, res) => {
    res.render('home/registo');
})

router.post('/registo', (req, res) => {
    //TODO: Fazer a verificação dos dados introduzidos pelo utilizador
    user.addUser(
        req.body.username,
        req.body.password,
        req.body.status
    );
    console.log("Novo Utilizador Registado");
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