const express = require('express');
const router = express.Router();
const UserDB = require('../../models/User');
const user = new UserDB();
const EscalaoDB = require('../../models/Escalao');
const escalao = new EscalaoDB();
const {userAuthenticated} = require('../../helpers/authentication');

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

    // Existem erros
    if(erros.length > 0) {
        res.render('home/admin/adicionarUtilizador', {erros: erros});
    } else {
        user.addUser(
            req.body.username,
            req.body.password,
            req.body.status ? 1 : 0
        ).then(()=>{
            req.flash('success', 'Utilizador Adicionado com sucesso');
            res.redirect('/admin/utilizadores');
        }).catch((err) => {
            // Erro que aparece quando o username já existe na base de dados (UNIQUE)
            if(err.code = 'SQLITE_CONSTRAINT'){
                req.flash('error', 'Utilizador já registado!');
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
    user.getAllUsers().then((rows) => {
        res.render('home/admin/utilizadores', {utilizadores: rows});
    }).catch((err) => {
        req.flash('error', 'Ocurreu um erro ao registar o utilizador!');
    });
});

router.delete('/utilizadores/:id', (req, res) => {
    user.deleteUser(req.params.id).then(() => {
        req.flash('success', `Utilizador eliminado com sucesso`)
        res.redirect('/admin/utilizadores');
    }).catch((err) => { 
        console.log(err);
        req.flash('error', 'Não foi possível eliminar o utilizador.');
        res.redirect('/admin/utilizadores');
    });
});

router.get('/editarUtilizador/:id', (req, res) => {
    user.getUserById(req.params.id).then((row) => {
        res.render('home/admin/editarUtilizador', {utilizador: row});
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível aceder aos dados do utilizador.');
        res.redirect('/admin/utilizadores');
    });
});

router.put('/editarUtilizador/:id', (req, res)=>{
    let erros = [];

    if(!req.body.username){
        erros.push({err_msg: 'Indique o username.'});
    } else {
        const username = req.body.username;
    }

    if(!req.body.password){
        erros.push({err_msg: 'Indique a password.'});
    }

    if(req.body.password !== req.body.verify_password){
        erros.push({err_msg: 'As passwords não são identicas.'});
    }

    // Existem erros
    if(erros.length > 0) {
        user.getUserById(req.params.id).then((row) => {
            res.render('home/admin/editarUtilizador', {utilizador: row, erros: erros});
        }).catch((err) => {
            console.log(err);
            res.render('home/admin/editarUtilizador', {erros: erros});
        });
    } else {
        user.updateUser(
            req.params.id,
            req.body.username,
            req.body.password,
            req.body.status ? 1 : 0
        ).then(() => {
            req.flash('success', 'Utilizador actualizado com sucesso');
            res.redirect('/admin/utilizadores');
        }).catch((err)=>{
            console.log(err);
            req.flash('error', 'Não foi possível actualizar o utilizador!');
            res.redirect('/admin/utilizadores');
        });
    }
});

router.get('/escaloes', (req, res) => {
    escalao.getAllEscaloes().then((rows) => {
        res.render('home/admin/escaloes', {escaloes: rows});
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter dados dos escalões.');
        res.redirect('/admin/escaloes');
    });
});
 
router.get('/escaloes/:sexo', (req, res) => {

    if(req.params.sexo == 'M' || req.params.sexo == 'F'){
        let sexo = req.params.sexo == 'M' ? 1 : 0;

        escalao.getAllEscaloesBySex(sexo).then((rows) => {
            res.render('home/admin/escaloes', {escaloes: rows, sexo: sexo});
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível obter dados dos escalões.');
            res.redirect('/admin/escaloes');
        });
    } else {
        req.flash('error', 'Escolha inválida.');
        res.redirect('/admin/escaloes');
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
        escalao.addEscalao(
            req.body.designacao,
            req.body.sexo
        ).then(() => {
            req.flash('success', 'Escalão adicionado com sucesso.');
            res.redirect('/admin/escaloes');
        }).catch((err) => {
            console.log(err)
            req.flash('error', 'Não foi possível adicionar o escalão.');
            res.redirect('/admin/escaloes');
        });
        
    }
});

router.get('/editarEscalao/:id', (req, res) => {
    escalao.getEscalaoById(req.params.id).then((row) => {
        res.render('home/admin/editarEscalao', {escalao: row});
    }).catch((err) => {
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
        escalao.getEscalaoById(req.params.id).then((row) => {
            res.render('home/admin/adicionarEscalao', {escalao: row, erros: erros});
        }).catch((err) => {
            console.log(err);
        });
    } else {
        escalao.updateEscalao(
            req.params.id,
            req.body.designacao,
            req.body.sexo
        ).then(()=>{
            req.flash('success', 'Escalão actualizado com sucesso.');
            res.redirect('/admin/escaloes');
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível actualizar o escalão.');
            res.redirect('/admin/escaloes');
        });
    }
});

router.delete('/escaloes/:id', (req, res) => {
    escalao.deleteEscalao(req.params.id).then(()=>{
        req.flash('success', 'Escalão eliminado com sucesso.');
        res.redirect('/admin/escaloes');
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível elimnar o escalão.');  
        res.redirect('/admin/escaloes'); 
    });
});

module.exports = router;