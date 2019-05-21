const malha = require('../helpers/connect');

exports.get_all_info = async function(req,res){
    let data = {
        torneio: req.session.torneio,
        fase: parseInt(req.params.fase),
        escalao: parseInt(req.params.escalao)
    };
    const torneio_id = req.session.torneio.torneio_id;
    const escalao_id = req.params.escalao;
    const fase = req.params.fase;

    // 1. Preencher um array com todas as fases até à actual
    const todasFases = [];
    for(let i = 0; i < fase; i++){ todasFases.push(i+1); }

    // 2. ver o número de campos
    // Fazer array e preencher
    const numCamposTorneio = await malha.jogos.getNumeroCamposPorFase(torneio_id, escalao_id, fase);
    const todosCampos = [];
    for(let i = 0; i < numCamposTorneio.numCampos; i++){ todosCampos.push(i+1); }

    // 3. Obter as informações sobre o escalão
    const escalaoInfo = await malha.escaloes.getEscalaoById(escalao_id);
    data.escalaoInfo = escalaoInfo;

    console.log(req.params.campo);

    // 4. Obter as equipas que ainda não têm pontuação
    data.campos = []; 
    for(const campo of todosCampos){
        // Adiciona o número do campo e inicializa o array das equipas
        const listaEquipas = await malha.jogos.getTodasEquipasSemParciaisPorCampo(torneio_id, escalao_id, campo);
        data.campos.push({campo: campo, equipas: listaEquipas});
    }

    res.render('home/torneio/resultados', {data: data, campos: todosCampos, fases: todasFases});
}