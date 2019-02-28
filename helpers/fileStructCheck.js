const fs =  require('fs');

module.exports = {

    dataDirectoryCheck: function(){
        const dir = './data';
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
}