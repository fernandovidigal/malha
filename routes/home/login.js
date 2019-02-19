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
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, 
(username, password, done) => {

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
    req.app.locals.layout = 'login';
    next();
});

router.get('/', (req, res) => {
    res.render('home/login');
});

router.post('/', (req,res,next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    })(req, res, next);
});

module.exports = router;