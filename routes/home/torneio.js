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
    helper_functions.distribuiEquipasPorCampos(malha);
    res.render('home/torneio/index', {data: data});
});

module.exports = router;