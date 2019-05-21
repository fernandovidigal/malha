const express = require('express');
const router = express.Router();
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');

const lettersRegExp = new RegExp('^[^0-9]+$');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    malha.localidades.getAllLocalidades()
    .then((localidades)=>{
        if(localidades.length > 0) {
            res.render('home/admin/localidades', {localidades: localidades});
        } else {
            res.render('home/admin/localidades');
        }
        
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter as localidades');
        res.redirect('/localidades');
    });
});

router.get('/adicionarLocalidade', (req, res) => {
    res.render('home/admin/adicionarLocalidade');
});

router.get('/editarLocalidade/:id', (req, res) => {
    malha.localidades.getLocalidadeByID(req.params.id)
    .then((localidade) => {
        if(localidade != undefined){
            res.render('home/admin/editarLocalidade', {localidade: localidade});
        } else {
            req.flash('error', 'Localidade não existente');
            res.redirect('/admin/localidades');
        }
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter os dados da localidade');
        res.redirect('/admin/localidades');
    });
});

// ADICIONAR LOCALIDADES
router.post('/adicionarLocalidade', (req, res) => {
    let erros = [];

    if(!req.body.localidade) {
        erros.push({err_msg: 'Indique o nome da localidade'});
    } else if(!lettersRegExp.test(req.body.localidade)){
        erros.push({err_msg: 'Nome da localidade inválido'});
    }

    if(erros.length > 0){
        res.render('home/admin/adicionarLocalidade', {erros: erros});
    } else {
        malha.localidades.addLocalidade(req.body.localidade)
        .then(()=>{
            req.flash('success', 'Localidade adicionada com sucesso!')
            res.redirect('/admin/localidades');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível adicionar a localidade');
            res.redirect('/admin/localidades');
        });
    }
});

// ACTUALIZAR LOCALIDADES
router.put('/editarLocalidade/:id', (req, res) => {
    let erros = [];

    if(!req.body.localidade) {
        erros.push({err_msg: 'Indique o nome da localidade'});
    } else if(!lettersRegExp.test(req.body.localidade)){
        erros.push({err_msg: 'Nome da localidade inválido'});
    }

    if(erros.length > 0){
        res.render('home/admin/adicionarLocalidade', {erros: erros});
    } else {
        malha.localidades.updateLocalidade(req.params.id, req.body.localidade)
        .then(()=>{
            req.flash('success', 'Localidade actualizada com sucesso');
            res.redirect('/admin/localidades');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível actualizar a localidade');
            res.redirect('/admin/localidades');
        });
    }
});

// ELIMINAR LOCALIDADES
router.delete('/:id', (req, res) => {
    malha.localidades.deleteLocalidade(req.params.id)
    .then(()=>{
        req.flash('success', 'Localidade eliminada com sucesso!')
        res.redirect('/admin/localidades');
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível eliminar a localidade');
        res.redirect('/admin/localidades');
    });
});

module.exports = router;