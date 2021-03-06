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
        ifCond: helpers.ifCond,
        sexoSelect: helpers.sexoSelect
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

// Check on Admin Menu
// Serve para manter o menu Adminstrativo aberto enquanto se está a utilizar as
// ferramentas de administração
app.use('/admin(/*)?', function(req, res, next){
    req.adminMenu = true;
    next();
});

app.use(function(req, res, next) {
    res.locals.user = req.user || null;
    res.locals.adminMenu = req.adminMenu || false;
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
const base = require('./routes/home/index');
const adminUtilizadores = require('./routes/admin/utilizadores');
const adminEscaloes = require('./routes/admin/escaloes');
const adminTorneios = require('./routes/admin/torneios');
const adminLocalidades = require('./routes/admin/localidades');
const equipas = require('./routes/home/equipas');
const torneio = require('./routes/home/torneio');

app.use('/login', login);
app.use('/', base);
app.use('/admin/utilizadores', adminUtilizadores);
app.use('/admin/escaloes', adminEscaloes);
app.use('/admin/torneios', adminTorneios);
app.use('/admin/localidades', adminLocalidades);
app.use('/equipas', equipas);
app.use('/torneio', torneio);

// Activar Servidor
app.listen(port, () => console.log(`Malha App em localhost:${port} ou <IP da máquina>:${port}`));