const express = require('./node_modules/express');
const app = express();
const port = 3000;
const Config = require('./config/Config');
const UserDB = require('./models/User');
const exphbs = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');

// Carregas configurações
const cfg = new Config();

// Carrega a base de dados de Utilizadores
// TODO: Talvez não seja necessário iniciaar aqui a base de dados dos utilizadores
const users = new UserDB();

// MIDDLEWARE
app.use(express.static(path.join(__dirname, 'assets')));

// Registar View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'home',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// SESSIONS
app.use(session({
    secret: "malhanodejs",
    resave: true,
    saveUninitialized: true
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

// Carregar Routes
const login = require('./routes/home/login');
const home = require('./routes/home/index');

app.use('/login', login);
app.use('/', home);

// Activar Servidor
app.listen(port, () => console.log(`Example app listening on port ${port}!`))