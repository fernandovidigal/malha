const express = require('express');
const router = express.Router();
const path = require('path');
const UserDB = require('../../models/User');
const user = new UserDB();

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
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

router.get('/login', (req, res) => {
    res.render('home/login');
});

router.post('/login', (req, res) => {
    user.lookupUser(req.body.username, req.body.password);
})

module.exports = router;