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

function verificaLocalidade(campo, localidade){
    return false;
}

function verificaCamposDisponiveis(listaCampos, localidade_id, maxEquipasPorCampo, numeroMinimoEquipasCampo = -1){
    let camposDisponiveis = new Array();
    let contemLocalidade = false;

    for(i = 0; i < listaCampos.length; i++){
        contemLocalidade = false;

        if(listaCampos[i].length < maxEquipasPorCampo){

            // Foi definido um número minimo de equipas por campo
            if(numeroMinimoEquipasCampo != -1){
                if(listaCampos[i].length == numeroMinimoEquipasCampo){
                    for(j = 0; j < listaCampos[i].length; j++){
                        if(listaCampos[i][j].localidade_id == localidade_id){
                            contemLocalidade = true;
                            break;
                        }
                    }
        
                    if(!contemLocalidade){
                        camposDisponiveis.push(i);
                    }
                }
            } else { // Não foi definido o número minimo de equipas por campo
                for(j = 0; j < listaCampos[i].length; j++){
                    if(listaCampos[i][j].localidade_id == localidade_id){
                        contemLocalidade = true;
                        break;
                    }
                }
    
                if(!contemLocalidade){
                    camposDisponiveis.push(i);
                }
            }
        }
    }
    return camposDisponiveis;
}

function verificaMinimoEquipasPorCampo(listaCampos, numeroMinimoEquipasCampo){

    for(i = 0; i < listaCampos.length; i++){
        // Existe pelo menos um campo com o mínimo de equipas actual
        if(listaCampos[i].length == numeroMinimoEquipasCampo){
            console.log("Existe campo com o nínimo de equipas");
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
async function distribuir(malhaDB, equipas, escalao, numCampos, minCampos, maxCampos){
    return new Promise(function(resolve, reject){
        
        const numeroEquipas = equipas.length;
        const totalCampos = determinaNumeroTotalCampos(equipas.length, numCampos, minCampos, maxCampos);
        if(totalCampos == 0){
            return reject("Número de campos insuficiente.");
        }

        const maxEquipasPorCampo = Math.ceil(numeroEquipas / totalCampos);

        const xpto = verificaLocalidade(1, 2);

        // Inicia a Array de campos
        let listaCampos = [];
        for(i = 0; i < totalCampos; i++){
            listaCampos.push(new Array());
        }

        let numeroMinimoEquipasCampo = 0;
        
        while(equipas.length > 0){
            console.log("Número de Equipas: " + equipas.length);

            // Obtem uma equipa aleatória
            const equipaRandom = Math.floor(Math.random() * equipas.length);
            let equipa = equipas[equipaRandom];
            console.log(equipa);
            console.log(" ");

            // Actualiza o número mínimo de equipas que existe em cada campo
            numeroMinimoEquipasCampo = verificaMinimoEquipasPorCampo(listaCampos, numeroMinimoEquipasCampo);
            console.log("Numero minino de equipas: " + numeroMinimoEquipasCampo);

            // Verifica o número de campos disponiveis para alocar a equipa
            let camposDisponiveis = verificaCamposDisponiveis(listaCampos, equipa.localidade_id, maxEquipasPorCampo, numeroMinimoEquipasCampo);
            console.log("Localidade: "+equipa.localidade_id);
            console.log("Campos Disponíveis: "+camposDisponiveis);

            if(camposDisponiveis.length != 0){
                console.log("Aqui");
                listaCampos[camposDisponiveis[0]].push(equipa);
                equipas.splice(equipaRandom, 1);
            } else {
                camposDisponiveis = verificaCamposDisponiveis(listaCampos, equipa.localidade_id, maxEquipasPorCampo);
                console.log("Campos Disponiveis2: " + camposDisponiveis);
                listaCampos[camposDisponiveis[0]].push(equipa);
                equipas.splice(equipaRandom, 1);
            }

            console.log(listaCampos);
        }
    });
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
                "equipa_id":equipa.equipa_id,
                "localidade_id":equipa.localidade_id
            };

            return data;
        });

        await distribuir(malhaDB, equipas, 1, numCampos, minCampos, maxCampos)
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



/*i = 0;
while(numeroEquipas > 0){
    if(i >= totalCampos) {
        i = 0;
    }
    const equipaRandom = Math.floor(Math.random() * numeroEquipas);
    console.log("Localidade: " + equipas[equipaRandom].localidade_id);
    listaCampos[i].push(equipas[equipaRandom]);
    equipas.splice(equipaRandom, 1);
    

    i++;
}

console.log(listaCampos);*/