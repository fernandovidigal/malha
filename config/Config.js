const fs =  require('fs');

class Config {

    constructor(){
        this.configs = {
            usersDatabaseLocation: "users.db",
            databaseLocation: "malha.db"
        };

        if(!fs.existsSync('config.json')){
            fs.writeFileSync('config.json', JSON.stringify(this.configs), (err) => {
                if(err) throw err;
            });
        } else {
            var settings = fs.readFileSync('config.json');
            this.configs = JSON.parse(settings);
        }
    }

    showConfigs(){
        console.log(this.configs);
    }
}


module.exports = Config; 