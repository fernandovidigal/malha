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
console.log(guardaResultados);

guardaResultados.forEach((btn, index) => {
    btn.addEventListener('click', function(e){
        e.preventDefault();
        // TODO: Ajax API Call  
        alert("Olá");
    });
});