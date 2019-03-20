const express = require('express');
const router = express.Router();
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');

const lettersRegExp = new RegExp('^[^0-9]+$');
const numbersRegExp = new RegExp('^[0-9]+$');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    malha.escaloes.getAllEscaloes()
    .then((escaloes) => {
        if(escaloes.length > 0){
            res.render('home/admin/escaloes', {escaloes: escaloes});
        } else {
            res.render('home/admin/escaloes');
        }  
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter dados dos escalões.');
        res.redirect('/admin/escaloes');
    });
});

router.get('/:sexo', (req, res) => {
    if(req.params.sexo === 'M' || req.params.sexo === 'F'){
        let sexo = req.params.sexo == 'M' ? 1 : 0;

        malha.escaloes.getAllEscaloesBySex(sexo)
        .then((escaloes) => {
            res.render('home/admin/escaloes', {escaloes: escaloes, sexo: sexo});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível obter dados dos escalões.');
            res.redirect('/admin/escaloes');
        });
    } else {
        req.flash('error', 'Escolha de filtro inválida.');
        res.redirect('/admin/escaloes');
    } 
});

module.exports = router;