const express = require('./node_modules/express');
const app = express();
const port = 3000;
const exphbs = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const {dataDirectoryCheck} = require('./helpers/fileStructCheck');
const {helpers} = require('./helpers/handlebars_helpers');

// Verifica a estrutura de ficheiros
dataDirectoryCheck();

// MIDDLEWARE
app.use(express.static(path.join(__dirname, 'assets')));

// Registar View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'home',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        checkAdmin: helpers.checkAdmin,
        adminNav: helpers.adminNav,
        sexo: helpers.sexo,
        sexoChecked: helpers.sexoChecked,
        sexoSelect: helpers.sexoSelect,
        escaloes: helpers.escaloes,
        torneioActivo: helpers.torneioActivo,
        listaEscaloes: helpers.listaEscaloes
    }
}));
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// SESSIONS
app.use(session({
    secret: "malhanodejs",
    resave: true,
    saveUninitialized: true,
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());

app.use(function(req, res, next) {
    res.locals.user = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.warning = req.flash('warning');
    next();
});

// METHOD OVERRIDE
app.use(methodOverride('_method'));

// Carregar Routes
const login = require('./routes/home/login');
const home = require('./routes/home/index');
const admin = require('./routes/home/admin');
const equipas = require('./routes/home/equipas');

app.use('/login', login);
app.use('/', home);
app.use('/admin', admin);
app.use('/equipas', equipas);

// Activar Servidor
app.listen(port, () => console.log(`Example app listening on port ${port}!`))