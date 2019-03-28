const express = require('express');
const router = express.Router();
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');
const {checkTorneioActivo} = require('../../helpers/torneioActivo');
const {helper_functions} = require('../../helpers/helper_functions');

router.all('/*', [userAuthenticated, checkTorneioActivo], (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res, next) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;

    // Verifica se o torneio tem o número de campos definido
    malha.torneios.getNumCampos(torneio_id)
    .then((numCampos)=>{
        if(numCampos != undefined) {
            if(numCampos.campos > 0) {
                next();
            } else {
                res.render('home/torneio/setNumeroCampos', {data: data});
            }
        } else {
            // Não conseguiu obter o número de campos
        }
    })
    .catch((err) => {
        console.log(err);
    });
});

// Router base quando já existe o número de campos predefinido
router.get('/', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };
    let torneio_id = req.session.torneio.torneio_id;

    helper_functions.distribuiEquipasPorCampos(malha);
    res.render('home/torneio/index', {data: data});
});

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
            res.redirect('/torneio');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível definir o número de campos');
            res.redirect('/torneio/setNumeroCampos');
        });
    }
});

module.exports = router;