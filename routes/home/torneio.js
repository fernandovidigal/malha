const express = require('express');
const router = express.Router();
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');
const {checkTorneioActivo} = require('../../helpers/torneioActivo');
const {torneio_functions} = require('../../helpers/torneio_functions');

router.all('/*', [userAuthenticated, checkTorneioActivo], (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;

    // Verifica se o torneio tem o número de campos definido
    malha.torneios.getNumCampos(torneio_id)
    .then((numCampos)=>{
        if(numCampos != undefined) {
            if(numCampos.campos > 0) {
                res.redirect('/torneio/campos');
            } else {
                res.render('home/torneio/setNumeroCampos', {data: data});
            }
        } else {
            // TODO: implementar e caso de erro
            // Não conseguiu obter o número de campos
        }
    })
    .catch((err) => {
        console.log(err);
        // TODO: Handle erro
    });
});

// ADICIONAR NÚMERO DE CAMPOS
router.post('/', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;
    let erros = [];
    const numbersRegExp = new RegExp('^[0-9]+$');

    if(!req.body.numCampos || req.body.numCampos == '') {
        erros.push({err_msg: 'Indique o número de campos'});
    } else if(!numbersRegExp.test(req.body.numCampos)){
        erros.push({err_msg: 'Número de campos inválido'});
    }

    if(erros.length > 0) {
        data.numCampos = req.body.numCampos;
        res.render('home/torneio/setNumeroCampos', {data: data, erros: erros});
    } else {
        malha.torneios.setNumCampos(torneio_id, parseInt(req.body.numCampos, 10))
        .then(()=>{
            req.flash('success', 'Número de campos definido com sucesso');
            res.redirect('/torneio/campos');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível definir o número de campos');
            res.redirect('/torneio/setNumeroCampos');
        });
    }
});

router.get('/campos', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;

    res.render('home/torneio/campos', {data: data});
});

router.post('/distribuirEquipas', (req, res)=>{
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;

    torneio_functions.distribuiEquipasPorCampos(torneio_id, malha, 4, 6)
    .catch((err) => {
        console.log(err);
    });

    res.send("Equipas Distribuidas");

    /*malha.equipas.getAllEscaloesWithEquipa(torneio_id)
    .then((escaloes)=>{
        console.log(escaloes);
    })
    .catch((err)=>{
        console.log(err);
    });
    req.flash('success', 'Equipas distribuidas com sucesso');
    res.redirect('/torneio/campos');*/
});

module.exports = router;