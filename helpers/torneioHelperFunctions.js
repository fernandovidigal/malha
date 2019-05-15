function determinaNumeroTotalCampos(numEquipas, numCamposTorneio, minEquipas, maxEquipas){
    
    // Minimo de campos necessário para se jogar
    const minCampos = Math.ceil(numEquipas / maxEquipas);
    console.log("min: " + minCampos);

    // Maximo de campos necessário para se jogar
    const maxCampos = Math.ceil(numEquipas / minEquipas);
    console.log("max: " + maxCampos);
    console.log(" ");

    if(numCamposTorneio < minCampos){
        return 0;
    }

    let found = false;
    let numCampos = 0;
    while(!found){
        numCampos = Math.floor(numEquipas / minEquipas);
        if((numEquipas - (numCampos * minEquipas) < minEquipas) && minEquipas < maxEquipas){
            minEquipas++;
        } else {
            found = true;
        }
    }
    console.log(numCampos);

    if(numCamposTorneio > maxCampos){
        return maxCampos;
    } else if(numCamposTorneio < minCampos){
        return 0;
    } else {
        return numCamposTorneio;
    }
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

    let emparelhamento = null;

    switch(equipas.length){
        case 2 :
            emparelhamento = equipas2;
            break;
        case 3 :
            emparelhamento = equipas3;
            break;
        case 4 :
            emparelhamento = equipas4;
            break;
        case 5 :
            emparelhamento = equipas5;
            break;
        case 6 :
            emparelhamento = equipas6;
            break;
        default:
            emparelhamento = null;
            break;    
    }

    return emparelhamento;
}

function shuffleLocalidades(listaLocalidades) {

    const localidades = [];

    while(listaLocalidades.length > 0){
        let numLocalidades = listaLocalidades.length;
        const randomLocalidade = Math.floor(Math.random() * numLocalidades);

        localidades.push(listaLocalidades[randomLocalidade]);
        listaLocalidades.splice(randomLocalidade, 1);

    }

    return localidades;

}

module.exports.torneioHelperFunctions = {

    // Ponderar utilizar promessas para quando terminar o processamento retornar
    distribuiEquipasPorCampos: async function(torneio_id, malhaDB, minEquipas, maxEquipas, escalao = 0){

        // Número de campos
        let numCamposTorneio = await malhaDB.torneios.getNumCampos(torneio_id);
        numCamposTorneio = numCamposTorneio.count;

        // Todos os escalões que têm equipas
        const listaEscaloes = await malhaDB.equipas.getAllEscaloesWithEquipa(torneio_id);
        //console.log(listaEscaloes);
        let escaloes = Array.from(listaEscaloes, escalao => escalao.escalao_id);

        if(escalao == 0){
            // Percorre todos os escalões
            for(const escalao of escaloes){
                //console.log("Escalão: " + escalao);

                // 1. Verificar o número total de equipas de cada escalão
                const numEquipasPorEscalao = await malhaDB.equipas.getNumEquipasPorEscalao(torneio_id, escalao);
                //console.log("Número de equipas por Escalão: " + numEquipasPorEscalao);

                // 2. Determinar o número máximo de campos necessário para cada escalão
                const numMaxCampos = determinaNumeroTotalCampos(numEquipasPorEscalao, numCamposTorneio, minEquipas, maxEquipas);
                //console.log("Número Máximo de campos: " + numMaxCampos);
                
                // 3. Inicia a Array de campos
                let listaCampos = [];
                for(i = 0; i < numMaxCampos; i++){
                    listaCampos.push(new Array());
                }

                // 4. Por cada localidade distribuir as respectivas equipas pelos campos
                let listaLocalidades = await malhaDB.localidades.getAllLocalidadesID();

                // 5. Baralha as localidades
                listaLocalidades = shuffleLocalidades(listaLocalidades);

                let k = 0;
                for(const localidade of listaLocalidades){
                    const numEquipasPorLocalidade = await malhaDB.equipas.getNumEquipasPorLocalidadeAndEscalao(torneio_id, localidade.localidade_id, escalao);

                    if(numEquipasPorLocalidade > 0){
                        const listaEquipasPorLocalidade = await malhaDB.equipas.getTeamsByLocalidadeAndEscalao(torneio_id, localidade.localidade_id, escalao);

                        // Adiciona a equipa à lista de campos
                        for(const equipa of listaEquipasPorLocalidade){
                            if(k >= numMaxCampos){
                                k = 0;
                            }

                            listaCampos[k].push(equipa);
                            k++;
                        }
                    }
                }

                for(i = 0; i < listaCampos.length; i++){
                    let emparelhamento = metodoEmparelhamento(listaCampos[i]);
                    for(const par of emparelhamento){
                        let equipa1 = listaCampos[i][par[0]];
                        let equipa2 = listaCampos[i][par[1]];

                        //await malhaDB.jogos.addJogo(torneio_id, escalao, 1, (i+1), equipa1.equipa_id, equipa2.equipa_id);
                    }
                }
            }
        } else {
            // Distribui equipas só do escalão passado como parametro
            // 1. Verificar o número total de equipas de cada escalão
            const numEquipasPorEscalao = await malhaDB.equipas.getNumEquipasPorEscalao(torneio_id, escalao);
            //console.log("Número de equipas por Escalão: " + numEquipasPorEscalao);

            // 2. Determinar o número máximo de campos necessário para cada escalão
            const numMaxCampos = determinaNumeroTotalCampos(numEquipasPorEscalao, numCamposTorneio, minEquipas, maxEquipas);
            //console.log("Número Máximo de campos: " + numMaxCampos);
            
            // 3. Inicia a Array de campos
            let listaCampos = [];
            for(i = 0; i < numMaxCampos; i++){
                listaCampos.push(new Array());
            }

            // 4. Por cada localidade distribuir as respectivas equipas pelos campos
            let listaLocalidades = await malhaDB.localidades.getAllLocalidadesID();

            // 5. Baralha as localidades
            listaLocalidades = shuffleLocalidades(listaLocalidades);

            let k = 0;
            for(const localidade of listaLocalidades){
                const numEquipasPorLocalidade = await malhaDB.equipas.getNumEquipasPorLocalidadeAndEscalao(torneio_id, localidade.localidade_id, escalao);

                if(numEquipasPorLocalidade > 0){
                    const listaEquipasPorLocalidade = await malhaDB.equipas.getTeamsByLocalidadeAndEscalao(torneio_id, localidade.localidade_id, escalao);

                    // Adiciona a equipa à lista de campos
                    for(const equipa of listaEquipasPorLocalidade){
                        if(k > (numMaxCampos-1)){
                            k = 0;
                        }

                        listaCampos[k].push(equipa);
                        k++;
                    }
                }
            }

            for(i = 0; i < listaCampos.length; i++){
                let emparelhamento = metodoEmparelhamento(listaCampos[i]);
                for(const par of emparelhamento){
                    let equipa1 = listaCampos[i][par[0]];
                    let equipa2 = listaCampos[i][par[1]];

                    await malhaDB.jogos.addJogo(torneio_id, escalao, 1, (i+1), equipa1.equipa_id, equipa2.equipa_id);
                }
            }
        }
    }

}