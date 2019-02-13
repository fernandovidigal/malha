const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserDB = require('../../models/User');
const user = new UserDB();

// APP LOGIN
//passport.use(new LocalStrategy)

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    res.render('home/index');
});

router.get('/registo', (req, res) => {
    user.getUser('admin').then((user) => {
        console.log(user);
    }).catch((err) => {
        console.log(err);
    });
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

router.get('/login', (req, res) => {
    res.render('home/login');
});

router.post('/login', (req, res) => {
    user.lookupUser(req.body.username, req.body.password);
})

module.exports = router;