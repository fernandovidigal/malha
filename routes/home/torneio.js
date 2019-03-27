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
                helper_functions.distribuiEquipasPorCampos(malha);
                res.render('home/torneio/index', {data: data});
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

router.post('/:numCampos', (req, res) => {
    
});

module.exports = router;