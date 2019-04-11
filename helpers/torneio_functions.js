function determinaNumeroTotalCampos(numEquipas, numCampos, minCampos, maxCampos){
    // Minimo de campos necessário para se jogar
    const minCamposOffset = Math.ceil(numEquipas / maxCampos);

    // Maximo de campos necessário para se jogar
    const maxCamposOffset = Math.ceil(numEquipas / minCampos);

    if(numCampos > maxCamposOffset){
        return maxCamposOffset;
    } else if(numCampos < minCamposOffset){
        return 0;
    } else {
        return numCampos;
    }
}

function verificaCamposDisponiveis(listaCampos, maxEquipasPorCampo, numeroMinimoEquipasCampo, localidade_id = -1){
    let camposDisponiveis = new Array();
    let contemLocalidade = false;

    for(i = 0; i < listaCampos.length; i++){
        contemLocalidade = false;

        // Número de equipas deve ser menor que o máximo de equipas por campo e campos deve ter o número
        // minimo de equipas
        if(listaCampos[i].length < maxEquipasPorCampo && listaCampos[i].length == numeroMinimoEquipasCampo){

            // Foi definida localidade
            if(localidade_id != -1){
                for(j = 0; j < listaCampos[i].length; j++){
                    if(listaCampos[i][j].localidade_id == localidade_id){
                        contemLocalidade = true;
                        break;
                    }
                }
    
                if(!contemLocalidade){
                    camposDisponiveis.push(i);
                }
            } else {
                // Não foi definido localidade então adiciona o campo
                camposDisponiveis.push(i);
            }
        }
    }
    return camposDisponiveis;
}

function verificaMinimoEquipasPorCampo(listaCampos, numeroMinimoEquipasCampo){

    for(i = 0; i < listaCampos.length; i++){
        // Existe pelo menos um campo com o mínimo de equipas actual
        if(listaCampos[i].length == numeroMinimoEquipasCampo){
            return numeroMinimoEquipasCampo;
        }
    }

    return (numeroMinimoEquipasCampo + 1);
}

// Por cada escalão
// 1. Verificar se o número de campos é suficiente para agrupamentos de 6 equipas (Num Equipas / 6),
//      ou seja, se o número de campor é superior, ficam campos sem equipas
// 2. Verificar se o número de campos é suficiente para agrupamentos de 4 equipas (Num Equipas / 4),
//      ou seja, se o número de campos for menor, significa que não existem campos suficientes para agrupar as equipas
// 3. Se nenhumas das condições anteriores se verificar então preenche todos os campos definido no número de campos do torneio.
async function distribuir(equipas, numCampos, minCampos, maxCampos){
    return new Promise(function(resolve, reject){
        
        const numeroEquipas = equipas.length;
        const totalCampos = determinaNumeroTotalCampos(equipas.length, numCampos, minCampos, maxCampos);
        if(totalCampos == 0){
            return reject("Número de campos insuficiente.");
        }

        const maxEquipasPorCampo = Math.ceil(numeroEquipas / totalCampos);

        // Inicia a Array de campos
        let listaCampos = [];
        for(i = 0; i < totalCampos; i++){
            listaCampos.push(new Array());
        }

        let numeroMinimoEquipasCampo = 0;
        
        while(equipas.length > 0){

            // Obtem uma equipa aleatória
            const equipaRandom = Math.floor(Math.random() * equipas.length);
            let equipa = equipas[equipaRandom];

            // Actualiza o número mínimo de equipas que existe em cada campo
            numeroMinimoEquipasCampo = verificaMinimoEquipasPorCampo(listaCampos, numeroMinimoEquipasCampo);

            // Verifica o número de campos disponiveis para alocar a equipa
            let camposDisponiveis = verificaCamposDisponiveis(listaCampos, maxEquipasPorCampo, numeroMinimoEquipasCampo, equipa.localidade_id);

            if(camposDisponiveis.length != 0){
                listaCampos[camposDisponiveis[0]].push(equipa);
                equipas.splice(equipaRandom, 1);
            } else {
                let tempNumeroMinimoEquipasCampo = numeroMinimoEquipasCampo;
                let existemCamposDisponiveis = false;

                while(camposDisponiveis == 0 && tempNumeroMinimoEquipasCampo < maxEquipasPorCampo){
                    tempNumeroMinimoEquipasCampo++;
                    camposDisponiveis = verificaCamposDisponiveis(listaCampos, maxEquipasPorCampo, tempNumeroMinimoEquipasCampo, equipa.localidade_id);
                    if(camposDisponiveis > 0){
                        existemCamposDisponiveis = true;
                    }
                }

                if(existemCamposDisponiveis){
                    listaCampos[camposDisponiveis[0]].push(equipa);
                    equipas.splice(equipaRandom, 1);
                } else {
                    camposDisponiveis = verificaCamposDisponiveis(listaCampos, maxEquipasPorCampo, numeroMinimoEquipasCampo);
                    listaCampos[camposDisponiveis[0]].push(equipa);
                    equipas.splice(equipaRandom, 1);
                }   
            }
        }

        return resolve(listaCampos);
    });
}

function verificaMaiorNumeroEquipasPorCampo(listaCampos){
    let numEquipas = 0;
    for(i = 0; i < listaCampos.length; i++){
        if(listaCampos[i].length > numEquipas){
            numEquipas = listaCampos[i].length;
        }
    }
    return numEquipas;
}


function ordenaCamposPorNumeroEquipas(listaCampos){
    let novaListaCampos = Array();
    let numEquipas = verificaMaiorNumeroEquipasPorCampo(listaCampos);

    while(listaCampos.length > 0){
        for(i = 0; i < listaCampos.length; i++){
            if(listaCampos[i].length == numEquipas){
                novaListaCampos.push(listaCampos[i]);
                listaCampos.splice(i, 1);
                i = 0;  
            }
        }
        numEquipas = verificaMaiorNumeroEquipasPorCampo(listaCampos);
    }

    return novaListaCampos;
}

function metodoEmparelhamento(equipas){
    const equipas2 = [
        [0,1]
    ];
    const equipas3 = [
        [0,1],
        [0,2],
        [1,2]
    ];
    const equipas4 = [
        [1,0],
        [2,3],
        [0,2],
        [3,1],
        [3,0],
        [2,1]
    ];
    const equipas5 = [
        [1,0],
        [2,4],
        [0,2],
        [4,3],
        [3,0],
        [2,1],
        [0,4],
        [1,3],
        [4,1],
        [3,2]
    ];
    const equipas6 = [
        [1,0],
        [2,4],
        [3,5],
        [0,2],
        [5,1],
        [4,3],
        [3,0],
        [2,1],
        [5,4],
        [0,4],
        [1,3],
        [2,5],
        [5,0],
        [4,1],
        [3,2]
    ];

    let emparelhamentoAUsar = null;

    switch(equipas.length){
        case 2 :
            emparelhamentoAUsar = equipas2;
            break;
        case 3 :
            emparelhamentoAUsar = equipas3;
            break;
        case 4 :
            emparelhamentoAUsar = equipas4;
            break;
        case 5 :
            emparelhamentoAUsar = equipas5;
            break;
        case 6 :
            emparelhamentoAUsar = equipas6;
            break;
        default:
            emparelhamentoAUsar = null;
            break;    
    }

    return emparelhamentoAUsar;
}


module.exports.torneio_functions = {

    // Ponderar utilizar promessas para quando terminar o processamento retornar
    distribuiEquipasPorCampos: async function(torneio_id, malhaDB, minCampos, maxCampos){

        // Número de campos
        let numCampos = await malhaDB.torneios.getNumCampos(torneio_id);
        numCampos = numCampos.campos;

        // Todos os escalões que têm equipas
        const listaEscaloes = await malhaDB.equipas.getAllEscaloesWithEquipa(torneio_id);
        let escaloes = Array.from(listaEscaloes, escalao => escalao.escalao_id);

        // Número de equipas por escalão
        const numEquipasPorEscalao = await malhaDB.equipas.getNumEquipasPorEscalao(torneio_id);

        // ***********
        const listaEquipas = await malhaDB.equipas.getAllEquipaIDAndLocalidade(torneio_id, 1);
        let equipas = Array.from(listaEquipas, equipa => {
            let data = {
                "equipa_id": equipa.equipa_id,
                "localidade_id": equipa.localidade_id
            };

            return data;
        });

        await distribuir(equipas, numCampos, minCampos, maxCampos)
            .then((listaCampos)=>{
                let listaCamposOrdenada = ordenaCamposPorNumeroEquipas(listaCampos);
                for(i = 0; i < listaCamposOrdenada.length; i++){
                    console.log("******************************");
                    let emparelhamento = metodoEmparelhamento(listaCamposOrdenada[i]);
                    for(j = 0; j < emparelhamento.length; j++){
                        // TODO: Adicionar à base de dados
                        console.log("Equipa1: ")
                        console.log(listaCamposOrdenada[i][emparelhamento[j][0]]);
                        console.log("Equipa2: ");
                        console.log(listaCamposOrdenada[i][emparelhamento[j][1]]);
                        console.log(" ");
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
        // ***********

        // Disbtribui equipas por campos por cada escalão
        /*escaloes.forEach(async (escalao) => {
            // Obtem a lista de equipas de cada escalão
            const listaEquipas = await malhaDB.equipas.getAllEquipasIDPorEscalao(torneio_id, escalao);
            let equipas = Array.from(listaEquipas, equipa => equipa.equipa_id);
            
            await distribuir(malhaDB, numCampos, equipas, escalao)
            .catch((err) => {
                console.log(err);
            });
        });*/

        /*malha.equipas.getAllEquipas(1)
        .then((listaEquipas)=>{
            let randomEquipa = Math.floor(Math.random() * listaEquipas.length);
        }).catch((err) => {
            console.log(err);
        });*/
    }
}