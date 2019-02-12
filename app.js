const express = require('./node_modules/express');
const app = express();
const port = 3000;
const Config = require('./config/Config');
const UserDB = require('./models/User');
const exphbs = require('express-handlebars');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');

// Carregas configurações
const cfg = new Config();

// Carrega a base de dados de Utilizadores
// TODO: Talvez não seja necessário iniciaar aqui a base de dados dos utilizadores
const users = new UserDB();

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

// Carregar Routes
const home = require('./routes/home/index');

app.use('/', home);

// Activar Servidor
app.listen(port, () => console.log(`Example app listening on port ${port}!`))