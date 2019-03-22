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

// FILTRO POR SEXO
router.get('/filtro/:sexo', (req, res) => {
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

// ADICIONAR ESCALÃO
router.get('/adicionarEscalao', (req, res) => {
    res.render('home/admin/adicionarEscalao');
});

router.post('/adicionarEscalao', (req, res) => {
    
    let erros = [];

    if(!req.body.designacao){
        erros.push({err_msg: 'Deve indicar a designação do escalão.'});
    }

    if(!req.body.sexo) {
        erros.push({err_msg: 'Deve indicar o sexo a que pertence o escalão.'});
    }

    if(erros.length > 0){
        let data = {
            designacao: req.body.designacao,
            sexo: req.body.sexo
        };
        res.render('home/admin/adicionarEscalao', {data: data, erros: erros});
    } else {
        malha.escaloes.addEscalao(
            req.body.designacao,
            req.body.sexo
        )
        .then(() => {
            req.flash('success', 'Escalão adicionado com sucesso.');
            res.redirect('/admin/escaloes');
        })
        .catch((err) => {
            console.log(err)
            req.flash('error', 'Não foi possível adicionar o escalão.');
            res.redirect('/admin/escaloes');
        });   
    }
});

// EDITAR ESCALÃO
router.get('/editarEscalao/:id', (req, res) => {
    malha.escaloes.getEscalaoById(req.params.id)
    .then((escalao) => {
        if(escalao != undefined){
            res.render('home/admin/editarEscalao', {escalao: escalao});
        } else {
            req.flash('error', 'Escalão não existente');
            res.redirect('/admin/escaloes');
        }
        
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível aceder ao escalão.');
        res.redirect('/admin/escaloes');
    });
});

router.put('/editarEscalao/:id', (req, res) => {
    let erros = [];

    if(!req.body.designacao){
        erros.push({err_msg: 'Deve indicar a designação do escalão.'});
    }

    if(!req.body.sexo) {
        erros.push({err_msg: 'Deve indicar o sexo a que pertence o escalão.'});
    }

    if(erros.length > 0){
        malha.escaloes.getEscalaoById(req.params.id)
        .then((escalao) => {
            escalao.designacao = req.body.designacao;
            escalao.sexo = req.body.sexo;
            res.render('home/admin/editarEscalao', {escalao: escalao, erros: erros});
        })
        .catch((err) => {
            console.log(err);
        });
    } else {
        malha.escaloes.updateEscalao(
            req.params.id,
            req.body.designacao,
            req.body.sexo
        )
        .then(()=>{
            req.flash('success', 'Escalão actualizado com sucesso.');
            res.redirect('/admin/escaloes');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível actualizar o escalão.');
            res.redirect('/admin/escaloes');
        });
    }
});

// APAGAR ESCALÃO
router.delete('/:id', (req, res) => {
    // TODO: Verificar se existe alguma equipa inscrita com este escalão
    // Se o escalão é apagado, todas as equipas devem ser apagadas
    malha.escaloes.deleteEscalao(req.params.id)
    .then(()=>{
        req.flash('success', 'Escalão eliminado com sucesso.');
        res.redirect('/admin/escaloes');
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível eliminar o escalão.');  
        res.redirect('/admin/escaloes'); 
    });
});

module.exports = router;