function determinaNumeroTotalCampos(numEquipas, numCamposTorneio, minEquipas, maxEquipas){

    // Minimo de campos necessário para se jogar
    const minCampos = Math.ceil(numEquipas / maxEquipas);

    // Maximo de campos necessário para se jogar
    const maxCampos = Math.ceil(numEquipas / minEquipas);

    if(numCamposTorneio > maxCampos){
        return maxCampos;
    } else if(numCamposTorneio < minCampos){
        return 0;
    } else {
        return numCamposTorneio;
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
async function distribuir(equipas, numCamposTorneio, minCampos, maxCampos){
    
    const numeroEquipas = equipas.length;
    const totalCampos = determinaNumeroTotalCampos(equipas.length, numCamposTorneio, minCampos, maxCampos);
    if(totalCampos == 0){
        throw new Error("Número de campos insuficiente.");
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

    return listaCampos;
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
    distribuiEquipasPorCampos: async function(torneio_id, malhaDB, minEquipas, maxEquipas){

        // Número de campos
        let numCamposTorneio = await malhaDB.torneios.getNumCampos(torneio_id);
        numCamposTorneio = numCamposTorneio.campos;

        // Todos os escalões que têm equipas
        const listaEscaloes = await malhaDB.equipas.getAllEscaloesWithEquipa(torneio_id);
        let escaloes = Array.from(listaEscaloes, escalao => escalao.escalao_id);

        for(const escalao of escaloes){
            const listaEquipas = await malhaDB.equipas.getAllEquipaIDAndLocalidadeByEscalao(torneio_id, 1);
            let equipas = Array.from(listaEquipas, equipa => {
                let data = {
                    "equipa_id": equipa.equipa_id,
                    "localidade_id": equipa.localidade_id
                };

                return data;
            });

            await distribuir(equipas, numCamposTorneio, minEquipas, maxEquipas)
            .then(async (listaCampos) => {
                let listaCamposOrdenada = ordenaCamposPorNumeroEquipas(listaCampos);

                for(i = 0; i < listaCamposOrdenada.length; i++){
                    let emparelhamento = metodoEmparelhamento(listaCamposOrdenada[i]);
                    for(const par of emparelhamento){
                        let equipa1 = listaCamposOrdenada[i][par[0]];
                        let equipa2 = listaCamposOrdenada[i][par[1]];

                        await malhaDB.jogos.addJogo(torneio_id, escalao, 1, (i+1), equipa1.equipa_id, equipa2.equipa_id);
                    }
                }
            })
            .catch((err) => {
                throw new Error("Número de campos insuficientes para o escalao: " + escalao);
            });
        }
    }
}