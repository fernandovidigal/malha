const express = require('./node_modules/express')
const app = express()
const port = 3000
//const sqlite3 = require('./node_modules/sqlite3').verbose()
//const db = new sqlite3.Database('users.db')
const bcrypt = require('./node_modules/bcryptjs')
//const Database = require('./config/database');
const Test = require('./config/Test');

let x = new Test();
x.loadPage();

app.get('/', function(req, res){
    res.send("Olá Mundo!")
})

//let db1 = new Database();
//db1.connect();

/*db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    status INTEGER NOT NULL DEFAULT 0
)`)

var stmt = db.prepare("INSERT INTO users (username, password) VALUES (?,?)")
var salt = bcrypt.genSaltSync(10);
stmt.run(bcrypt.hashSync('admin', salt), bcrypt.hashSync('12345', salt));
stmt.finalize();*/


/*db.serialize(function() {
    db.run("CREATE TABLE lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
        console.log(row.id + ": " + row.info);
    });
});*/

//db.close();

app.listen(port, () => console.log(`Example app listening on port ${port}!`))