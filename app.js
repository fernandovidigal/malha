const express = require('express')
const app = express()
const port = 3000
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('users.db')
const bcrypt = require('bcryptjs')

app.get('/', function(req, res){
    res.send("Olá Mundo!")
})

db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    status INTEGER NOT NULL DEFAULT 0
)`)

var stmt = db.prepare("INSERT INTO users (username, password) VALUES (?,?)")
var salt = bcrypt.genSaltSync(10);
stmt.run(bcrypt.hashSync('admin', salt), bcrypt.hashSync('12345', salt));
stmt.finalize();
/*var usernameHash = 'A';
var passwordHash = 'A';
bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash('admin', salt, (err, hash) => {
        usernameHash = hash;
        console.log(hash);
    });
});
bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash('12345', salt, (err, hash) => {
        passwordHash = hash
        console.log(hash);
    });
});
console.log(usernameHash);
console.log(passwordHash);*/
//stmt.run(usernameHash, passwordHash);


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

db.close();

app.listen(port, () => console.log(`Example app listening on port ${port}!`))