const torneioDB = require('../models/Torneios');

module.exports = {

    checkTorneioActivo: function(req, res, next){
        if(!req.session.torneio){
            const torneios = new torneioDB();
            torneios.getActiveTorneio()
            .then((row) => {
                if(!row) {
                    torneios.close();
                    req.flash('error', 'Não existem torneios registados ou não existem torneios activos.<br><a href="/admin/torneios" class="msg_link">Adicionar ou Activar um torneio</a>');
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