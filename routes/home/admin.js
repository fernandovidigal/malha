const express = require('express');
const router = express.Router();
const UserDB = require('../../models/User');
const user = new UserDB();
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    res.render('home/admin/index');
});

router.get('/registo', (req, res) => {
    res.render('home/admin/registo');
});

router.post('/registo', (req, res) => {
    // TODO: validação dos dados introduzidos
    user.addUser(
        req.body.username,
        req.body.password,
        req.body.status ? 1 : 0
    ).then(()=>{
        req.flash('success', 'Utilizador Adicionado com sucesso');
        res.redirect('/admin');
    }).catch((err) => {
        // Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: users.username] errno: 19, code: 'SQLITE_CONSTRAINT'
        if(err.code = 'SQLITE_CONSTRAINT'){
            req.flash('error', 'Utilizador já registado!');
            // Rever aqui o render. Se não é melhor o redirect
            res.render('home/admin/registo');
        } else {
            req.flash('error', 'Ocurreu um erro ao registar o utilizador!');
            console.log(err);
            // Rever aqui o render. Se não é melhor o redirect
            res.render('home/admin/index');
        }
    });
    
});

router.get('/lista', (req, res) => {
    user.getAllUsers().then((rows) => {
        res.render('home/admin/lista', {users: rows});
    }).catch((err) => {
        req.flash('error', 'Ocurreu um erro ao registar o utilizador!');
    });
});

module.exports = router;