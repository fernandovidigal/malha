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
    malha.torneios.getAllTorneios()
    .then((torneios) => {
        if(torneios.length > 0) {
            res.render('home/admin/torneios', {torneios: torneios});
        } else {
            res.render('home/admin/torneios');
        }
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter a lista de torneios.');
        res.redirect('/admin/torneios');
    });
});

// ADICIONAR TORNEIO
router.get('/adicionarTorneio', (req, res) => {
    res.render('home/admin/adicionarTorneio');
});

router.post('/adicionarTorneio', (req, res) => {
    let erros = [];
    let numCampos = 0;

    if(!req.body.designacao){
        erros.push({err_msg: 'Indique a designação do torneio.'});
    }

    if(!req.body.localidade) {
        erros.push({err_msg: 'Indique a localidade onde irá decorrer o torneio.'});
    } else if(!lettersRegExp.test(req.body.localidade)){
        erros.push({err_msg: 'Localidade inválida'});
    }

    if(!req.body.ano) {
        erros.push({err_msg: 'Indique o ano do torneio.'});
    } else if(!numbersRegExp.test(req.body.ano)){
        erros.push({err_msg: 'Ano do torneio inválido'});
    }

    if(req.body.campos){
        if(numbersRegExp.test(req.body.campos)){
            numCampos = req.body.campos;
        } else {
            erros.push({err_msg: 'Número de campos inválido'});
        } 
    }

    if(erros.length > 0){
        let data = {
            designacao: req.body.designacao,
            localidade: req.body.localidade,
            ano: req.body.ano,
            campos: req.body.campos
        }
        res.render('home/admin/adicionarTorneio', {torneio: data, erros: erros});
    } else {
        //Adiciona o Torneio
        malha.torneios.addTorneio(
            req.body.designacao,
            req.body.localidade,
            parseInt(req.body.ano),
            numCampos
        )
        .then((id) => {
            // Activa o torneio
            if(req.body.adicionar_activar){
                malha.torneios.setActiveTorneio(id)
                .then(()=>{
                    return malha.torneios.getActiveTorneio();
                })
                .then((torneioActivo)=>{
                    req.session.torneio = torneioActivo;
                    req.flash('success', 'Torneio adicionado e activado com sucesso!')
                    res.redirect('/admin/torneios');
                })
                .catch((err) => {
                    console.log(err);
                    req.flash('error', 'Não foi possível activar o torneio!');
                    res.redirect('/admin/torneios');
                });
            } else { // Não escolheu activar o torneio
                // Obtem número de torneios. Se houver apenas 1 torneio registado activa-o
                malha.torneios.getNumTorneios()
                .then((numTorneios) => {
                    if(numTorneios == 1) {
                        malha.torneios.setActiveTorneio(id)
                        .then(()=>{
                            req.flash('success', 'Torneio adicionado com sucesso!')
                            res.redirect('/admin/torneios');
                        })
                        .catch((err) => {
                            console.log(err);
                            req.flash('error', 'Não foi possível activar o torneio');
                            res.redirect('/admin/torneios');
                        });
                    } else {
                        req.flash('success', 'Torneio adicionado com sucesso!')
                        res.redirect('/admin/torneios');
                    }
                })
                .catch((err) => {
                    console.log(err);
                    req.flash('error', 'Não foi possível activar o torneio');
                    res.redirect('/admin/torneios');
                });
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível adicionar o torneio!');
            res.redirect('/admin/torneios');
        });
    }  
});

// EDITAR TORNEIO
router.get('/editarTorneio/:id', (req, res) => {
    malha.torneios.getTorneioById(req.params.id)
    .then((torneio) => {
        if(torneio != undefined){
            res.render('home/admin/editarTorneio', {torneio: torneio});
        } else {
            req.flash('error', 'Torneio não existente');
            res.redirect('/admin/torneios');
        }
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível aceder ao torneio.');
        res.redirect('/admin/torneios');
    });
});

router.put('/editarTorneio/:id', (req, res) => {
    let erros = [];

    if(!req.body.designacao){
        erros.push({err_msg: 'Indique a designação do torneio.'});
    }

    if(!req.body.localidade) {
        erros.push({err_msg: 'Indique a localidade onde irá decorrer o torneio.'});
    } else if(!lettersRegExp.test(req.body.localidade)){
        erros.push({err_msg: 'Localidade inválida'});
    }

    if(!req.body.ano) {
        erros.push({err_msg: 'Indique o ano do torneio.'});
    } else if(!numbersRegExp.test(req.body.ano)){
        erros.push({err_msg: 'Ano do torneio inválido'});
    }

    if(!req.body.campos) {
        erros.push({err_msg: 'Indique o número de campos do torneio.'});
    } else if(!numbersRegExp.test(req.body.campos)){
        erros.push({err_msg: 'Número de campos inválido'});
    }

    if(erros.length > 0){
        malha.torneios.getTorneioById(req.params.id)
        .then((torneio) => {
            torneio.designacao = req.body.designacao;
            torneio.localidade = req.body.localidade;
            torneio.ano = req.body.ano;
            torneio.campos = req.body.campos;
            res.render('home/admin/editarTorneio', {torneio: torneio, erros: erros});
        })
        .catch((err) => {
            console.log(err);
        });
    } else {
        malha.torneios.updateTorneio(
            req.params.id,
            req.body.designacao,
            req.body.localidade,
            req.body.ano,
            req.body.campos
        )
        .then(()=>{
            req.flash('success', 'Torneio actualizado com sucesso.');
            res.redirect('/admin/torneios');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível actualizar o torneio.');
            res.redirect('/admin/torneios');
        });
    }
});

// APAGAR TORNEIO
router.delete('/:id', (req, res) => {
    malha.torneios.deleteTorneio(req.params.id)
    .then(()=>{
        req.flash('success', 'Torneio eliminado com sucesso.');
        res.redirect('/admin/torneios');
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível eliminar o torneio.');  
        res.redirect('/admin/torneios'); 
    });
});

// ACTIVA TORNEIO
router.get('/activaTorneio/:id', (req, res) => {
    malha.torneios.setActiveTorneio(req.params.id)
    .then(() => {
        malha.torneios.getActiveTorneio()
        .then((torneio) => {
            req.session.torneio = torneio;
            req.flash('success', 'Torneio activado com sucesso');
            res.redirect('/admin/torneios');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível obter o torneio activo');
            res.redirect('/admin/torneios');
        });
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível activar o torneio');
        res.redirect('/admin/torneios');
    });
});


module.exports = router;