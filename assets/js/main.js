var msgCloseBtn = document.querySelector('.msg_close');

if(msgCloseBtn){
    msgCloseBtn.addEventListener('click', function(e){
        e.preventDefault();
        var msgBlock = this.parentNode;
        msgBlock.remove();
    });
}


// RESULTADOS
let guardaResultados = document.getElementsByName('guardaResultados');
let campoWrapper = document.querySelectorAll('.campo__wrapper');

guardaResultados.forEach((btn, index) => {
    btn.addEventListener('click', function(e){
        e.preventDefault();

        const campoWrapper = document.querySelector('.campo__wrapper');
        const currentForm = btn.closest('.resultados__form');
        const currentEquipasInfowrapper = currentForm.querySelector(".equipasInfo__wrapper");

        const jogoID = btn.dataset.jogoid;

        const equipa1_parcial1 = currentForm.elements['equipa1_parcial1'].value;
        const equipa1_parcial2 = currentForm.elements['equipa1_parcial2'].value;
        const equipa1_parcial3 = currentForm.elements['equipa1_parcial3'].value;

        const equipa2_parcial1 = currentForm.elements['equipa2_parcial1'].value;
        const equipa2_parcial2 = currentForm.elements['equipa2_parcial2'].value;
        const equipa2_parcial3 = currentForm.elements['equipa2_parcial3'].value;


        let equipa1_pontos_text = currentForm.querySelector('.equipa1_pontos');
        //equipa1_pontos_text.innerHTML = equipa1_pontos;

        let equipa2_pontos_text = currentForm.querySelector('.equipa2_pontos');
        //equipa2_pontos_text.innerHTML = equipa2_pontos;

        // Cria o componente de carregamento loading
        const loadingDiv = createLoading();
        const currentBtnWrapper = btn.closest('.btn_wrapper');
        // Substitui o botão pelo componente de carregamento
        currentBtnWrapper.replaceChild(loadingDiv, btn);

        fetch('/torneio/resultados/registaParciais', {
            headers: { "Content-Type": "application/json; charset=utf-8" },
            method: 'POST',
            body: JSON.stringify({
                jogo_id: jogoID,
                parciaisData: {
                    equipa1: {
                        parcial1: equipa1_parcial1,
                        parcial2: equipa1_parcial2,
                        parcial3: equipa1_parcial3
                    },
                    equipa2: {
                        parcial1: equipa2_parcial1,
                        parcial2: equipa2_parcial2,
                        parcial3: equipa2_parcial3
                    }
                }
            })
        })
        .then(function(response){
            if(response.status != 200){
                throw new Error("Não foi possível adicionar os parciais");
            }
            
            return response.json();
        }).then(data => {
            if(!data.success){
                throw new Error("Não foi possível adicionar os parciais");
            }

            alert("Adicionar com sucesso");
            campoWrapper.removeChild(currentForm);
            equipa1_pontos_text.innerHTML = data.equipa1_pontos;
            equipa2_pontos_text.innerHTML = data.equipa2_pontos;
            campoWrapper.appendChild(currentForm);

            // TODO: adicionar botões Edit e Remove
            const editBtn = createEditButton(jogoID);
            const deleteBtn = createDeleteButton(jogoID);

            currentBtnWrapper.innerHTML = "";
            currentBtnWrapper.appendChild(editBtn);
            currentBtnWrapper.appendChild(deleteBtn);

            currentEquipasInfowrapper.classList.add('resultados_finalizados');
        })
        .catch(function(err){
            alert(err);
        });
    });
});

function createLoading(){
    const loadingDiv = document.createElement("DIV");
    loadingDiv.classList.add("loading");

    const bounce1Div = document.createElement("DIV");
    bounce1Div.classList.add("bounce1");
    const bounce2Div = document.createElement("DIV");
    bounce2Div.classList.add("bounce2");
    const bounce3Div = document.createElement("DIV");
    bounce3Div.classList.add("bounce3");

    loadingDiv.appendChild(bounce1Div);
    loadingDiv.appendChild(bounce2Div);
    loadingDiv.appendChild(bounce3Div);

    return loadingDiv;
}

function createEditButton(jogo_id){
    const editButton = document.createElement("A");
    editButton.setAttribute("href", "");
    editButton.classList.add("btn__edit-resultados");
    editButton.setAttribute("name", "editarResultados");
    editButton.setAttribute("data-jogoid", jogo_id);
    editButton.innerHTML = "Editar";

    return editButton;
}

function createDeleteButton(jogo_id){
    const deleteButton = document.createElement("A");
    deleteButton.setAttribute("href", "");
    deleteButton.classList.add("btn__delete-resultados");
    deleteButton.setAttribute("name", "deleteResultados");
    deleteButton.setAttribute("data-jogoid", jogo_id);
    deleteButton.innerHTML = "Eliminar";

    return deleteButton;
}