const express = require('express');
const router = express.Router();
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');
const {checkTorneioActivo} = require('../../helpers/torneioActivo');
const {torneio_functions} = require('../../helpers/torneio_functions');

const numbersRegExp = new RegExp('^[0-9]+$');

router.all('/*', [userAuthenticated, checkTorneioActivo], (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', async (req, res, next) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;

    const fase = await malha.jogos.getFaseTorneio(torneio_id);

    const numCamposTorneio = malha.torneios.getNumCampos(torneio_id);
    const numJogosFase = malha.jogos.getNumJogosPorFase(torneio_id, (!fase ? 0 : fase.fase));
    
    await Promise.all([numCamposTorneio, numJogosFase])
    .then(([camposResult, jogosResult])=>{
        const numCampos = camposResult.campos;
        const numJogos = jogosResult.numJogos;

        if(numCampos == 0){
            res.render('home/torneio/setNumeroCampos', {data: data});
        } else if(numCampos > 0 && numJogos == 0){
            res.render('home/torneio/distribuirEquipas', {data: data});
        } else {
            next();
        }
    }).catch((err) => {
        console.log(err);
        // TODO: Handle erro
    });
});

router.get('/', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;
    
    res.render('home/torneio/index', {data: data});
});

// ADICIONAR NÚMERO DE CAMPOS
router.post('/', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;
    let erros = [];

    if(!req.body.numCampos || req.body.numCampos == '') {
        erros.push({err_msg: 'Deve indicar o número de campos'});
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
            res.redirect('/torneio/distribuirEquipas');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível definir o número de campos');
            res.redirect('/torneio/setNumeroCampos');
        });
    }
});

router.get('/distribuirEquipas', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;

    res.render('home/torneio/distribuirEquipas', {data: data});
});

router.post('/distribuirEquipas', (req, res)=>{
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;
    const minEquipas = req.body.minEquipasCampo;
    const maxEquipas = req.body.maxEquipasCampo;

    let erros = new Array();

    if(!minEquipas || minEquipas == ''){
        erros.push({err_msg: "Deve indicar o número mínimo de equipas por campo"});
    } else if(minEquipas < 2){
        erros.push({err_msg: "O mínimo de equipas por campo deve ser no mínimo 2"});
    } else if(!numbersRegExp.test(minEquipas)){
        erros.push({err_msg: 'Número mínimo de equipas inválido'});
    }

    if(!maxEquipas || maxEquipas == ''){
        erros.push({err_msg: "Deve indicar o número máximo de equipas por campo"});
    } else if(maxEquipas < minEquipas){
        erros.push({err_msg: "O máximo de equipas por campo deve ser maior ou igual ao número mínimo de equipas"});
    } else if(!numbersRegExp.test(maxEquipas)){
        erros.push({err_msg: 'Número máximo de equipas inválido'});
    }

    if(erros.length > 0){
        data.minEquipas = minEquipas;
        data.maxEquipas = maxEquipas;
        res.render('home/torneio/distribuirEquipas', {data: data, erros: erros});
    } else {
        torneio_functions.distribuiEquipasPorCampos(torneio_id, malha, minEquipas, maxEquipas)
        .catch((err) => {
            // TODO: Tratar dos Erros
            console.log("BB " + err);
        });

        req.flash('success', 'Equipas distribuidas com sucesso');
        res.redirect('/torneio/index');
    }
});

module.exports = router;