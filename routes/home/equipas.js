const express = require('express');
const router = express.Router();
const faker = require('faker');
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');
const {checkTorneioActivo} = require('../../helpers/torneioActivo');

const textRegExp = new RegExp('^[^0-9]+$'); 

async function getEscaloesAndLocalidades(){
    const escaloes = await malha.escaloes.getAllEscaloes();
    const localidades = await malha.localidades.getAllLocalidades();

    return {
        escaloes: escaloes,
        localidades: localidades
    }
}

router.all('/*', [userAuthenticated, checkTorneioActivo], (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});

router.get('/faker/:num', (req, res) => {
    var escaloes = [];
    var localidades = [];

    faker.locale = "pt_BR";
    malha.escaloes.getAllEscaloes()
    .then(async (rows) => {
        rows.forEach(escalao => {
            escaloes.push(escalao.escalao_id);
        });
        return malha.localidades.getAllLocalidades();
    })
    .then(async (rows) => {
        rows.forEach(localidade => {
            localidades.push(localidade.localidade_id);
        });

        var i;
        for(i = 0; i < req.params.num; i++){
            await malha.equipas.addEquipa(
                req.session.torneio.torneio_id,
                faker.name.firstName() + " " + faker.name.lastName(),
                faker.name.firstName() + " " + faker.name.lastName(),
                localidades[Math.floor(Math.random() * localidades.length)],
                escaloes[Math.floor(Math.random() * escaloes.length)]
            );
        } 
        return req.params.num;
    })
    .then((num)=> {
        req.flash("success", `${num} adicionadas com sucesso`);
        res.redirect('/equipas');
    });
});

router.get('/', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };

    malha.equipas.getAllEquipas(req.session.torneio.torneio_id)
    .then((equipas) => {
        if(equipas.length > 0){
            data.equipas = equipas;
        }
        return getEscaloesAndLocalidades();
    })
    .then((rows) => {
        if(rows.escaloes.length > 0){
            data.escaloes = rows.escaloes;
        }

        if(rows.localidades.length > 0){
            data.localidades = rows.localidades;
        }
        res.render('home/equipas/index', {data: data});
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Ocurreu um erro ao aceder ao menu Equipas');
        res.redirect('../');
    });
});

// ADICIONAR EQUIPA
router.get('/adicionarEquipa', (req, res) => {
    getEscaloesAndLocalidades()
    .then((rows)=>{
        res.render('home/equipas/adicionarEquipa', {escaloes: rows.escaloes, localidades: rows.localidades, torneio: req.session.torneio});
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter os escalões');
        res.redirect('/equipas');
    });
});

router.post('/adicionarEquipa', (req, res) => {
    let erros = [];

    if(!req.body.primeiro_elemento){
        erros.push({err_msg: 'Indique o nome do primeiro elemento.'});
    } else if(!textRegExp.test(req.body.primeiro_elemento)){
        erros.push({err_msg: 'Nome do primeiro elemento inválido.'});
    }

    if(!req.body.segundo_elemento){
        erros.push({err_msg: 'Indique o nome do segundo elemento.'});
    } else if(!textRegExp.test(req.body.segundo_elemento)){
        erros.push({err_msg: 'Nome do segundo elemento inválido.'});
    }

    if(!req.body.localidade){
        erros.push({err_msg: 'Selecione a localidade.'});
    } else if(req.body.localidade == 0){
        erros.push({err_msg: 'Deve selecionar a localidade.'});
    }

    if(!req.body.escalao){
        erros.push({err_msg: 'Indique o escalão.'});
    }

    if(erros.length > 0){
        getEscaloesAndLocalidades()
        .then((rows) => {
            let data = {
                primeiro_elemento: req.body.primeiro_elemento,
                segundo_elemento: req.body.segundo_elemento,
                localidade: req.body.localidade,
                escalao: req.body.escalao
            }
            res.render('home/equipas/adicionarEquipa', {equipa: data, escaloes: rows.escaloes, localidades: rows.localidades, torneio: req.session.torneio, erros: erros});
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível obter os escalões ou localidades');
            res.redirect('/equipas');
        });
    } else {
        malha.equipas.addEquipa(
            req.session.torneio.torneio_id,
            req.body.primeiro_elemento,
            req.body.segundo_elemento,
            req.body.localidade,
            req.body.escalao
        ).then(() => {
            req.flash('success', 'Equipa adicionada com sucesso');
            res.redirect('/equipas');
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível adicionar a equipa');
            res.redirect('/equipas');
        });
    }
});

// EDITAR EQUIPA
router.get('/editarEquipa/:id', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };

    malha.equipas.getEquipaByID(req.params.id, req.session.torneio.torneio_id)
    .then((equipa) => {
        if(equipa != undefined){
            data.equipa = equipa;
        }
        return getEscaloesAndLocalidades();
    })
    .then((rows) => {
        data.escaloes = rows.escaloes;
        data.localidades = rows.localidades;
        res.render('home/equipas/editarEquipa', {data: data});
    })
    .catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível aceder à equipa.');
        res.redirect('/equipas');
    });
});

router.put('/editarEquipa/:id', (req, res) => {
    let data = {
        'torneio': req.session.torneio
    };

    let erros = [];

    if(!req.body.primeiro_elemento){
        erros.push({err_msg: 'Indique o nome do primeiro elemento.'});
    } else if(!textRegExp.test(req.body.primeiro_elemento)){
        erros.push({err_msg: 'Nome do primeiro elemento inválido.'});
    }

    if(!req.body.segundo_elemento){
        erros.push({err_msg: 'Indique o nome do segundo elemento.'});
    } else if(!textRegExp.test(req.body.segundo_elemento)){
        erros.push({err_msg: 'Nome do segundo elemento inválido.'});
    }

    if(!req.body.localidade){
        erros.push({err_msg: 'Selecione a localidade.'});
    } else if(req.body.localidade == 0){
        erros.push({err_msg: 'Deve selecionar a localidade.'});
    }

    if(!req.body.escalao){
        erros.push({err_msg: 'Indique o escalão.'});
    }

    if(erros.length > 0){
        data.erros = erros;
        malha.equipas.getEquipaByID(req.params.id, req.session.torneio.torneio_id)
        .then((equipa) => {
            if(equipa != undefined){
                data.equipa = equipa;
                data.equipa.primeiro_elemento = req.body.primeiro_elemento;
                data.equipa.segundo_elemento = req.body.segundo_elemento;
                data.equipa.localidade_id = req.body.localidade;
                data.equipa.escalao_id = req.body.escalao;
            }
            return getEscaloesAndLocalidades();
        })
        .then((rows) => {
            data.escaloes = rows.escaloes;
            data.localidades = rows.localidades;
            res.render('home/equipas/editarEquipa', {data: data});
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível obter os escalões');
            res.redirect('/equipas');
        });
    } else {
        console.log(req.body);
        malha.equipas.updateEquipa(
            req.params.id,
            req.session.torneio.torneio_id,
            req.body.primeiro_elemento,
            req.body.segundo_elemento,
            req.body.localidade,
            req.body.escalao
        ).then(()=>{
            req.flash('success', 'Equipa actualizada com sucesso');
            res.redirect('/equipas');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível actualizar a equipa');
            res.redirect('/equipas');
        });
    }
});

router.delete('/:id', (req, res) => {
    if(req.session.torneio != null) {
        malha.equipas.deleteEquipa(req.params.id, req.session.torneio.torneio_id)
        .then(() => {
            req.flash('success', 'Equipa eliminada com sucesso');
            res.redirect('/equipas');
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível adicionar a equipa');
            res.redirect('/equipas');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

/////////////////////////////////////////////////////
//      PESQUISA EQUIPA POR ID
/////////////////////////////////////////////////////

router.post('/pesquisa', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'equipa_id': req.body.searchTeamID,
            'torneio': req.session.torneio
        };

        // Verifica se o input é númerico e com pelo menos 1 digito
        const numbersRegExp = new RegExp('^[0-9]+$');
        let teamID = -1;
        if(numbersRegExp.test(req.body.searchTeamID)){
            teamID = req.body.searchTeamID;
        }

        malha.equipas.getEquipaByID(teamID, req.session.torneio.torneio_id)
        .then((equipa) => {
            if(equipa.length > 0){
                data.equipas = equipa;
            }
            return getEscaloesAndLocalidades(req.session.torneio.torneio_id);
        })
        .then((rows) => {
            data.escaloes = rows.escaloes;
            data.localidades = rows.localidades;
            res.render('home/equipas/index', {data: data});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro');
            res.redirect('/equipas');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

/////////////////////////////////////////////////////
//      FILTROS
/////////////////////////////////////////////////////

async function filtraLocalidadeEscalao(torneio, localidade = null, escalao = null){
    if(localidade != null && escalao != null){
        // Retorna equipas filtradas por localidade e escalao
        // URL: /equipas/filtro/localidade/:localidade/escalao/:escalao
        //console.log("Localidade: "+localidade+", Escalao: " + escalao);
        return await malha.equipas.getTeamsByLocalidadeAndEscalao(torneio, localidade, escalao);
    } else if(localidade != null && escalao == null){
        // Retorna equipas filtradas por localidade
        // URL: /equipas/filtro/localidade/:localidade
        //console.log("Localidade: " + localidade);
        return await malha.equipas.getTeamsByLocalidade(torneio, localidade);
    } else if(localidade == null && escalao != null) {
        // Retorna equipas filtradas por escalao
        // URL: /equipas/filtro/escalao/:escalao
        //console.log("Escalao: " + escalao);
        return await malha.equipas.getAllEquipasByEscalao(torneio, escalao);
    } else {
        // Retornar erro
        console.log("Erro: Não foi possível fazer filtragem");
    }
}

function filtraLocalidade(torneio, localidade){
    return filtraLocalidadeEscalao(torneio, localidade, null);
}

function filtraEscalao(torneio, escalao){
    return filtraLocalidadeEscalao(torneio, null, escalao);
}

// FILTRO POR ESCALÃO
router.get('/filtro/escalao/:escalao', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'filtros': { escalao: req.params.escalao},
            'torneio': req.session.torneio
        };

        filtraEscalao(req.session.torneio.torneio_id, req.params.escalao)
        .then((equipas) => {
            data.equipas = equipas;
            return getEscaloesAndLocalidades(req.session.torneio.torneio_id);
        })
        .then((rows) => {
            data.escaloes = rows.escaloes;
            data.localidades = rows.localidades;
            res.render('home/equipas/index', {data: data});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro ao aceder ao menu Equipas');
            res.redirect('../');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

// FILTRO POR LOCALIDADE
router.get('/filtro/localidade/:localidade', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'filtros': { localidade: req.params.localidade},
            'torneio': req.session.torneio
        };

        filtraLocalidade(req.session.torneio.torneio_id, req.params.localidade)
        .then((equipas) => {
            data.equipas = equipas;
            return getEscaloesAndLocalidades(req.session.torneio.torneio_id);
        })
        .then((rows) => {
            data.escaloes = rows.escaloes;
            data.localidades = rows.localidades;
            res.render('home/equipas/index', {data: data});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro ao aceder ao menu Equipas');
            res.redirect('../');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

// FILTRO POR LOCALIDADE E ESCALÃO
router.get('/filtro/localidade/:localidade/escalao/:escalao', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'filtros': {
                localidade: req.params.localidade,
                escalao: req.params.escalao
            },
            'torneio': req.session.torneio
        };

        filtraLocalidadeEscalao(req.session.torneio.torneio_id, req.params.localidade, req.params.escalao)
        .then((equipas) => {
            data.equipas = equipas;
            return getEscaloesAndLocalidades(req.session.torneio.torneio_id);
        })
        .then((rows) => {
            data.escaloes = rows.escaloes;
            data.localidades = rows.localidades;
            res.render('home/equipas/index', {data: data});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro ao aceder ao menu Equipas');
            res.redirect('../');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

module.exports = router;