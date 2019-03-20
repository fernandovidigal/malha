const express = require('express');
const router = express.Router();
const UsersDB = require('../../models/Users');
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');

const lettersRegExp = new RegExp('^[^0-9]+$');
const numbersRegExp = new RegExp('^[0-9]+$');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    res.render('home/admin/index');
});

router.get('/adicionarUtilizador', (req, res) => {
    res.render('home/admin/adicionarUtilizador');
});

router.post('/adicionarUtilizador', (req, res) => {
    let erros = [];

    if(!req.body.username){
        erros.push({err_msg: 'Indique o username.'});
    }

    if(!req.body.password){
        erros.push({err_msg: 'Indique a password.'});
    }

    if(req.body.password !== req.body.verify_password){
        erros.push({err_msg: 'As passwords não são identicas.'});
    }

    const users = new UsersDB();

    // Existem erros
    if(erros.length > 0) {
        users.closeDB();
        res.render('home/admin/adicionarUtilizador', {erros: erros});
    } else {
        users.addUser(
            req.body.username,
            req.body.password,
            req.body.status ? 1 : 0
        )
        .then(()=>{
            users.closeDB();
            req.flash('success', 'Utilizador Adicionado com sucesso');
            res.redirect('/admin/utilizadores');
        })
        .catch((err) => {
            users.closeDB();
            // Erro que aparece quando o username já existe na base de dados (UNIQUE)
            if(err.code = 'SQLITE_CONSTRAINT'){
                req.flash('error', 'Username já está foi utilizado.');
                res.redirect('/admin/adicionarUtilizador');
            } else {
                req.flash('error', 'Ocurreu um erro ao registar o utilizador!');
                console.log(err);
                res.redirect('/admin/utilizadores');
            }
        });
    }
    
});

router.get('/utilizadores', (req, res) => {
    const users = new UsersDB();
    users.getAllUsers()
    .then((rows) => {
        users.closeDB();
        res.render('home/admin/utilizadores', {utilizadores: rows});
    })
    .catch((err) => {
        req.flash('error', 'Ocurreu um erro ao registar o utilizador!');
    });
});

router.delete('/utilizadores/:id', (req, res) => {
    const users = new UsersDB();
    users.deleteUser(req.params.id)
    .then(() => {
        users.closeDB();
        req.flash('success', `Utilizador eliminado com sucesso`)
        res.redirect('/admin/utilizadores');
    })
    .catch((err) => { 
        console.log(err);
        users.closeDB();
        req.flash('error', 'Não foi possível eliminar o utilizador.');
        res.redirect('/admin/utilizadores');
    });
});

router.get('/editarUtilizador/:id', (req, res) => {
    const users = new UsersDB();
    users.getUserById(req.params.id)
    .then((row) => {
        users.closeDB();
        res.render('home/admin/editarUtilizador', {utilizador: row});
    })
    .catch((err) => {
        console.log(err);
        users.closeDB();
        req.flash('error', 'Não foi possível aceder aos dados do utilizador.');
        res.redirect('/admin/utilizadores');
    });
});

router.put('/editarUtilizador/:id', (req, res)=>{
    let erros = [];

    if(!req.body.username){
        erros.push({err_msg: 'Indique o username.'});
    }

    if(!req.body.password){
        erros.push({err_msg: 'Indique a password.'});
    }

    if(req.body.password !== req.body.verify_password){
        erros.push({err_msg: 'As passwords não são identicas.'});
    }

    const users = new UsersDB();
    // Existem erross
    if(erros.length > 0) {
        users.getUserById(req.params.id)
        .then((row) => {
            users.closeDB();
            row.username = req.body.username;
            res.render('home/admin/editarUtilizador', {utilizador: row, erros: erros});
        })
        .catch((err) => {
            console.log(err);
            users.closeDB();
            res.render('home/admin/editarUtilizador', {erros: erros});
        });
    } else {
        users.updateUser(
            req.params.id,
            req.body.username,
            req.body.password,
            req.body.status ? 1 : 0
        )
        .then(() => {
            users.closeDB();
            req.flash('success', 'Utilizador actualizado com sucesso');
            res.redirect('/admin/utilizadores');
        })
        .catch((err)=>{
            console.log(err);
            users.closeDB();
            req.flash('error', 'Não foi possível actualizar o utilizador!');
            res.redirect('/admin/utilizadores');
        });
    }
});


 


router.get('/adicionarEscalao', (req, res) => {
    res.render('home/admin/adicionarEscalao');
});

router.post('/adicionarEscalao', (req, res) => {
    
    let erros = [];

    if(!req.body.designacao){
        erros.push({err_msg: 'Indique a designação.'});
    }

    if(!req.body.sexo) {
        erros.push({err_msg: 'Indique o sexo a que pertence o escalão.'});
    }

    if(erros.length > 0){
        res.render('home/admin/adicionarEscalao', {erros: erros});
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

router.get('/editarEscalao/:id', (req, res) => {
    malha.escaloes.getEscalaoById(req.params.id)
    .then((row) => {
        res.render('home/admin/editarEscalao', {escalao: row});
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
        erros.push({err_msg: 'Indique a designação.'});
    }

    if(!req.body.sexo) {
        erros.push({err_msg: 'Indique o sexo a que pertence o escalão.'});
    }

    if(erros.length > 0){
        malha.escaloes.getEscalaoById(req.params.id)
        .then((row) => {
            row.designacao = req.body.designacao;
            res.render('home/admin/editarEscalao', {escalao: row, erros: erros});
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

router.delete('/escaloes/:id', (req, res) => {
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