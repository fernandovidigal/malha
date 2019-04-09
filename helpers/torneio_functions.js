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
    
}

// Por cada escalão
// 1. Verificar se o número de campos é suficiente para agrupamentos de 6 equipas (Num Equipas / 6),
//      ou seja, se o número de campor é superior, ficam campos sem equipas
// 2. Verificar se o número de campos é suficiente para agrupamentos de 4 equipas (Num Equipas / 4),
//      ou seja, se o número de campos for menor, significa que não existem campos suficientes para agrupar as equipas
// 3. Se nenhumas das condições anteriores se verificar então preenche todos os campos definido no número de campos do torneio.
async function distribuir(malhaDB, equipas, escalao, numCampos, minCampos, maxCampos){
    return new Promise(function(resolve, reject){
        
        const totalCampos = determinaNumeroTotalCampos(equipas.length, numCampos, minCampos, maxCampos);
        console.log("Total Campos: " + totalCampos);
        if(totalCampos == 0){
            return reject("Número de campos insuficiente.");
        }

        // Inicia a Array de campos
        listaCampos = [];
        for(i = 0; i < totalCampos; i++){
            listaCampos.push([]);
        }

        i = 0;
        while(equipas.length > 0){
            if(i >= totalCampos) {
                i = 0;
            }
            const equipaRandom = Math.floor(Math.random() * equipas.length);
            console.log("Length: " + equipas.length);
            console.log("equipaRandom: " + equipaRandom);
            console.log("Equipa["+equipaRandom+"] = " + equipas[equipaRandom]);
            listaCampos[i].push(equipas[equipaRandom]);
            equipas.splice(equipaRandom, 1);
            

            i++;
        }

        console.log(listaCampos);
    });
}

module.exports.torneio_functions = {

    // Ponderar utilizar promessas para quando terminar o processamento retornar
    distribuiEquipasPorCampos: async function(torneio_id, malhaDB, minCampos, maxCampos){

        // Número de campos
        let numCampos = await malhaDB.torneios.getNumCampos(torneio_id);
        numCampos = numCampos.campos;
        //console.log(numCampos);

        // Todos os escalões que têm equipas
        const listaEscaloes = await malhaDB.equipas.getAllEscaloesWithEquipa(torneio_id);
        let escaloes = Array.from(listaEscaloes, escalao => escalao.escalao_id);
        //console.log(escaloes);

        // Número de equipas por escalão
        const numEquipasPorEscalao = await malhaDB.equipas.getNumEquipasPorEscalao(torneio_id);
        //console.log(numEquipasPorEscalao);

        // ***********
        const listaEquipas = await malhaDB.equipas.getAllEquipaIDAndLocalidade(torneio_id, 1);
        let equipas = Array.from(listaEquipas, equipa => [equipa.equipa_id, equipa.localidade_id]);

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