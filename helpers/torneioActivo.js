const torneioDB = require('../models/Torneios');

module.exports = {

    checkTorneioActivo: function(req, res, next){
        if(!req.session.torneio){
            const torneios = new torneioDB();
            torneios.getActiveTorneio()
            .then((row) => {
                if(!row) {
                    torneios.close();
                    req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
                    res.redirect('../');
                } else {
                    torneios.close();
                    req.session.torneio = row;
                    next();
                }
            })
            .catch((err) => {
                console.log(err);
                torneios.close();
                req.flash('error', 'Ocurreu um erro');
                res.redirect('/equipas');
            });
        } else {
            next();
        }
    }
}