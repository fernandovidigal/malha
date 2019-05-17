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
        // TODO: Ajax API Call

        const campoWrapper = document.querySelector('.campo__wrapper');
        const currentForm = btn.parentNode.parentNode.parentNode;
        console.log(currentForm);

        const equipa1_parcial1 = currentForm.elements['equipa1_parcial1'].value;
        const equipa1_parcial2 = currentForm.elements['equipa1_parcial2'].value;
        const equipa1_parcial3 = currentForm.elements['equipa1_parcial3'].value;

        const equipa2_parcial1 = currentForm.elements['equipa2_parcial1'].value;
        const equipa2_parcial2 = currentForm.elements['equipa2_parcial2'].value;
        const equipa2_parcial3 = currentForm.elements['equipa2_parcial3'].value;

        let equipa1_pontos = 0;
        let equipa2_pontos = 0;

        if(equipa1_parcial1 == 30 && equipa2_parcial1 < 30){
            equipa1_pontos++;
        } else if(equipa1_parcial1 < 30 && equipa2_parcial1 == 30){
            equipa2_pontos++;
        }

        if(equipa1_parcial2 == 30 && equipa2_parcial2 < 30){
            equipa1_pontos++;
        } else if(equipa1_parcial2 < 30 && equipa2_parcial2 == 30){
            equipa2_pontos++;
        }

        if(equipa1_parcial3 == 30 && equipa2_parcial3 < 30){
            equipa1_pontos++;
        } else if(equipa1_parcial3 < 30 && equipa2_parcial3 == 30){
            equipa2_pontos++;
        }

        let equipa1_pontos_text = currentForm.querySelector('.equipa1_pontos');
        equipa1_pontos_text.innerHTML = equipa1_pontos;

        let equipa2_pontos_text = currentForm.querySelector('.equipa2_pontos');
        equipa2_pontos_text.innerHTML = equipa2_pontos;

        campoWrapper.removeChild(currentForm);
        campoWrapper.appendChild(currentForm)

    });
});