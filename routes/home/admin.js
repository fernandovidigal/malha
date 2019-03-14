const express = require('express');
const router = express.Router();
const UserDB = require('../../models/User');
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

    const user = new UserDB();

    // Existem erros
    if(erros.length > 0) {
        user.closeDB();
        res.render('home/admin/adicionarUtilizador', {erros: erros});
    } else {
        user.addUser(
            req.body.username,
            req.body.password,
            req.body.status ? 1 : 0
        ).then(()=>{
            user.closeDB();
            req.flash('success', 'Utilizador Adicionado com sucesso');
            res.redirect('/admin/utilizadores');
        }).catch((err) => {
            user.closeDB();
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
    const user = new UserDB();
    user.getAllUsers().then((rows) => {
        user.closeDB();
        res.render('home/admin/utilizadores', {utilizadores: rows});
    }).catch((err) => {
        req.flash('error', 'Ocurreu um erro ao registar o utilizador!');
    });
});

router.delete('/utilizadores/:id', (req, res) => {
    const user = new UserDB();
    user.deleteUser(req.params.id).then(() => {
        user.closeDB();
        req.flash('success', `Utilizador eliminado com sucesso`)
        res.redirect('/admin/utilizadores');
    }).catch((err) => { 
        console.log(err);
        user.closeDB();
        req.flash('error', 'Não foi possível eliminar o utilizador.');
        res.redirect('/admin/utilizadores');
    });
});

router.get('/editarUtilizador/:id', (req, res) => {
    const user = new UserDB();
    user.getUserById(req.params.id).then((row) => {
        user.closeDB();
        res.render('home/admin/editarUtilizador', {utilizador: row});
    }).catch((err) => {
        console.log(err);
        user.closeDB();
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

    const user = new UserDB();
    // Existem erros
    if(erros.length > 0) {
        user.getUserById(req.params.id).then((row) => {
            user.closeDB();
            row.username = req.body.username;
            res.render('home/admin/editarUtilizador', {utilizador: row, erros: erros});
        }).catch((err) => {
            console.log(err);
            user.closeDB();
            res.render('home/admin/editarUtilizador', {erros: erros});
        });
    } else {
        user.updateUser(
            req.params.id,
            req.body.username,
            req.body.password,
            req.body.status ? 1 : 0
        ).then(() => {
            user.closeDB();
            req.flash('success', 'Utilizador actualizado com sucesso');
            res.redirect('/admin/utilizadores');
        }).catch((err)=>{
            console.log(err);
            user.closeDB();
            req.flash('error', 'Não foi possível actualizar o utilizador!');
            res.redirect('/admin/utilizadores');
        });
    }
});

router.get('/escaloes', (req, res) => {
    malha.escalao.getAllEscaloes().then((rows) => {
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

        malha.escalao.getAllEscaloesBySex(sexo).then((rows) => {
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
        malha.escalao.addEscalao(
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
    malha.escalao.getEscalaoById(req.params.id).then((row) => {
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
        malha.escalao.getEscalaoById(req.params.id).then((row) => {
            row.designacao = req.body.designacao;
            res.render('home/admin/editarEscalao', {escalao: row, erros: erros});
        }).catch((err) => {
            console.log(err);
        });
    } else {
        malha.escalao.updateEscalao(
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
    malha.escalao.deleteEscalao(req.params.id).then(()=>{
        req.flash('success', 'Escalão eliminado com sucesso.');
        res.redirect('/admin/escaloes');
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível eliminar o escalão.');  
        res.redirect('/admin/escaloes'); 
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////
//  TORNEIOS
////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/torneios', (req, res) => {
    malha.torneio.getAllTorneios().then((rows) => {
        res.render('home/admin/torneios', {torneios: rows});
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter os torneios.');
        res.redirect('/admin/torneios');
    });
    
});

router.get('/adicionarTorneio', (req, res) => {
    res.render('home/admin/adicionarTorneio');
});

router.post('/adicionarTorneio', (req, res) => {
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

    if(erros.length > 0){
        res.render('home/admin/adicionarTorneio', {erros: erros});
    } else {
        //Adiciona o Torneio
        malha.torneio.addTorneio(
            req.body.designacao,
            req.body.localidade,
            parseInt(req.body.ano)
        ).then((id) => {
            // Activa o torneio
            if(req.body.adicionar_activar){
                malha.torneio.setActiveTorneio(id)
                .then(()=>{
                    return malha.torneio.getActiveTorneio();
                }).then((row)=>{
                    req.session.torneio = row;
                    req.flash('success', 'Torneio adicionado e activado com sucesso!')
                    res.redirect('/admin/torneios');
                }).catch((err) => {
                    req.flash('error', 'Não foi possível activar o torneio!');
                    res.redirect('/admin/torneios');
                });
            } else { // Não escolheu activar o torneio
                malha.torneio.getNumTorneios().then((numTorneios) => {
                    if(numTorneios == 1) {
                        malha.torneio.setActiveTorneio(id).then(()=>{
                            req.flash('success', 'Torneio adicionado com sucesso!')
                            res.redirect('/admin/torneios');
                        }).catch((err) => {
                            console.log(err);
                            req.flash('error', 'Não foi possível activar o torneio');
                            res.redirect('/admin/torneios');
                        });
                    } else {
                        req.flash('success', 'Torneio adicionado com sucesso!')
                        res.redirect('/admin/torneios');
                    }
                }).catch((err) => {
                    console.log(err);
                    req.flash('error', 'Não foi possível activar o torneio');
                    res.redirect('/admin/torneios');
                });
            }
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível adicionar o torneio!');
            res.redirect('/admin/torneios');
        });
    }  
});

router.get('/editarTorneio/:id', (req, res) => {
    malha.torneio.getTorneioById(req.params.id).then((row) => {
        res.render('home/admin/editarTorneio', {torneio: row});
    }).catch((err) => {
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

    if(erros.length > 0){
        malha.torneio.getTorneioById(req.params.id).then((row) => {
            row.designacao = req.body.designacao;
            row.localidade = req.body.localidade;
            row.ano = req.body.ano;
            res.render('home/admin/editarTorneio', {torneio: row, erros: erros});
        }).catch((err) => {
            console.log(err);
        });
    } else {
        malha.torneio.updateTorneio(
            req.params.id,
            req.body.designacao,
            req.body.localidade,
            req.body.ano
        ).then(()=>{
            req.flash('success', 'Torneio actualizado com sucesso.');
            res.redirect('/admin/torneios');
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível actualizar o torneio.');
            res.redirect('/admin/torneios');
        });
    }
});

router.delete('/torneios/:id', (req, res) => {
    malha.torneio.deleteTorneio(req.params.id).then(()=>{
        req.flash('success', 'Torneio eliminado com sucesso.');
        res.redirect('/admin/torneios');
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível eliminar o torneio.');  
        res.redirect('/admin/torneios'); 
    });
});

router.get('/activaTorneio/:id', (req, res) => {
    malha.torneio.setActiveTorneio(req.params.id).then(() => {
        malha.torneio.getActiveTorneio().then((row) => {
            req.session.torneio = row;
            req.flash('success', 'Torneio activado com sucesso');
            res.redirect('/admin/torneios');
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível obter o torneio activo');
            res.redirect('/admin/torneios');
        });
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível activar o torneio');
        res.redirect('/admin/torneios');
    });
});

module.exports = router;