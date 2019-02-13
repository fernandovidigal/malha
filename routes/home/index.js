const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserDB = require('../../models/User');
const user = new UserDB();
const {userAuthenticated} = require('../../helpers/authentication');

// APP LOGIN
const errMsg = "Utilizador ou Password incorrectos";
passport.use(new LocalStrategy({usernameField: 'username'}, (username, password, done) => {

    user.getUser(username).then(user => {
        if(!user)
            return done(null, false, {message: errMsg});
        
            bcrypt.compare(password, user.password, (err, matched) => {
                if(matched) {
                    console.log("User Login");
                    return done(null, user);
                } else {
                    return done(null, false, {message: errMsg});
                }
            });
    }).catch(err => {
        console.log(err);
        return done(null, false, {message: errMsg});
    });
}))

passport.serializeUser(function(user, done){
    done(null, user.user_id);
})

passport.deserializeUser(function(id, done){
    user.getUserById(id).then(user => {
        done(null, user);
    }).catch(err => {
        console.log(err);
        done(null, false);
    });
});

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res) => {
    res.render('home/index');
});

router.get('/query', (req, res) => {
    user.getUser('admin').then((user) => {
        console.log(user.user_id);
        console.log(user.username);
        console.log(user.password);
        console.log(user.status);
    }).catch((err) => {
        console.log(err);
    });
    res.render('home/index');
});

router.get('/registo', (req, res) => {
    res.render('home/registo');
})

router.post('/registo', (req, res) => {
    //TODO: Fazer a verificação dos dados introduzidos pelo utilizador
    user.addUser(
        req.body.username,
        req.body.password,
        req.body.status
    );
    console.log("Novo Utilizador Registado");
    res.render('home/index');
});

router.get('/login', (req, res) => {
    res.render('home/login');
});

router.post('/login', (req,res,next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    })(req, res, next);
});

router.post('/login', (req, res) => {
    user.lookupUser(req.body.username, req.body.password);
})

module.exports = router;