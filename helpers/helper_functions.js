module.exports.helper_functions = {

    // Ponderar utilizar promessas para quando terminar o processamento retornar
    distribuiEquipasPorCampos: async function(malha){
        malha.equipas.getAllEquipas(1)
        .then((listaEquipas)=>{
            let randomEquipa = Math.floor(Math.random() * listaEquipas.length);
        }).catch((err) => {
            console.log(err);
        });
    }
}