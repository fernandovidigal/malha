const express = require('express');
const router = express.Router();
const faker = require('faker');
const {malha} = require('../../helpers/connect');
const {userAuthenticated} = require('../../helpers/authentication');

const textRegExp = new RegExp('^[^0-9]+$');

async function getEscaloesAndLocalidades(torneio_id){
    const escaloes = await malha.escaloes.getAllEscaloes();
    const localidades = await malha.equipas.getAllLocalidades(torneio_id);
    return {
        escaloes: escaloes,
        localidades: localidades
    }
}

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'home';
    if(!req.session.torneio){
        malha.torneios.getActiveTorneio().then((row) => {
            if(!row) {
                req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
                res.redirect('../');
            } else {
                req.session.torneio = row;
                next();
            }
        }).catch((err) => {
            console.log(err);
            req.flash('error', 'Ocurreu um erro');
            res.redirect('/equipas');
        });
    } else {
        next();
    }
});

router.get('/faker/:num', (req, res) => {
    var escaloes = [];
    var localidades = ['Arraiolos', 'Mora', 'Évora', 'Montemor-o-Novo', 'Lavre', 'Estremoz', 'Borba', 'Viana do Alentejo', 'Redondo'];

    faker.locale = "pt_BR";
    malha.escaloes.getAllEscaloes()
    .then(async (rows) => {
        rows.forEach(element => {
            escaloes.push(element.escalao_id);
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
            console.log(i+": Equipa Adicionada");
        } 
        return req.params.num;
    })
    .then((num)=> {
        req.flash("success", `${num} adicionadas com sucesso`);
        res.redirect('/equipas');
    });
});

router.get('/', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'torneio': req.session.torneio
        };
        malha.equipas.getAllEquipasByTorneio(req.session.torneio.torneio_id)
        .then((row) => {
            if(row.length > 0){
                data.equipas = row;
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
            req.flash('error', 'Ocurreu um erro ao aceder ao menu Equipas');
            res.redirect('../');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

router.get('/adicionarEquipa', (req, res) => {
    malha.escaloes.getAllEscaloes().then((rows) => {
        res.render('home/equipas/adicionarEquipa', {escaloes: rows, torneio: req.session.torneio});
    }).catch((err) => {
        console.log(err);
        req.flash('error', 'Não foi possível obter os escalões');
        res.redirect('/equipas');
    });
});

router.post('/adicionarEquipa', (req, res) => {
    if(req.session.torneio != null) {
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
            erros.push({err_msg: 'Indique a localidade.'});
        } else if(!textRegExp.test(req.body.localidade)){
            erros.push({err_msg: 'Nome da localidade inválido.'});
        }

        if(!req.body.escalao){
            erros.push({err_msg: 'Indique o escalão.'});
        }

        if(erros.length > 0){
            malha.escaloes.getAllEscaloes().then((rows) => {
                res.render('home/equipas/adicionarEquipa', {erros: erros, escaloes: rows, torneio: req.session.torneio});
            }).catch((err) => {
                console.log(err);
                req.flash('error', 'Não foi possível obter os escalões');
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
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

router.get('/editarEquipa/:id', (req, res) => {
    if(req.session.torneio != null) {
        let data = {
            'torneio': req.session.torneio
        };

        malha.equipas.getEquipaByID(req.params.id, req.session.torneio.torneio_id)
        .then((equipa) => {
            if(equipa.length > 0){
                data.equipa = equipa;
            }
            return malha.escaloes.getAllEscaloes();
        })
        .then((escaloes) => {
            data.escaloes = escaloes;
            res.render('home/equipas/editarEquipa', {data: data});
        })
        .catch((err) => {
            console.log(err);
            req.flash('error', 'Não foi possível aceder à equipa.');
            res.redirect('/equipas');
        });
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
    }
});

router.put('/editarEquipa/:id', (req, res) => {
    if(req.session.torneio != null) {
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
            erros.push({err_msg: 'Indique a localidade.'});
        } else if(!textRegExp.test(req.body.localidade)){
            erros.push({err_msg: 'Nome da localidade inválido.'});
        }

        if(!req.body.escalao){
            erros.push({err_msg: 'Indique o escalão.'});
        }

        if(erros.length > 0){
            data.erros = erros;
            malha.equipas.getEquipaByID(req.params.id, req.session.torneio.torneio_id)
            .then((equipa) => {
                if(equipa.length > 0){
                    data.equipa = equipa;
                    data.equipa[0].primeiro_elemento = req.body.primeiro_elemento;
                    data.equipa[0].segundo_elemento = req.body.segundo_elemento;
                    data.equipa[0].localidade = req.body.localidade;
                }
                return malha.escaloes.getAllEscaloes();
            })
            .then((escaloes) => {
                data.escaloes = escaloes;
                res.render('home/equipas/editarEquipa', {data: data});
            }).catch((err) => {
                console.log(err);
                req.flash('error', 'Não foi possível obter os escalões');
                res.redirect('/equipas');
            });
        } else {
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
        
    } else {
        console.log("Não existe torneio registado ou activo");
        req.flash('error', 'Não é possível aceder ao menu Equipas. É necessário criar ou activar um torneio');
        res.redirect('../');
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
        return await malha.equipas.getTeamsByTorneioAndLocalidadeAndEscalao(torneio, localidade, escalao);
    } else if(localidade != null && escalao == null){
        // Retorna equipas filtradas por localidade
        // URL: /equipas/filtro/localidade/:localidade
        //console.log("Localidade: " + localidade);
        return await malha.equipas.getTeamsByTorneioAndLocalidade(torneio, localidade);
    } else if(localidade == null && escalao != null) {
        // Retorna equipas filtradas por escalao
        // URL: /equipas/filtro/escalao/:escalao
        //console.log("Escalao: " + escalao);
        return await malha.equipas.getAllEquipasByTorneioAndEscalao(torneio, escalao);
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