var msgCloseBtn = document.querySelector('.msg_close');

if(msgCloseBtn){
    msgCloseBtn.addEventListener('click', function(e){
        e.preventDefault();
        var msgBlock = this.parentNode;
        msgBlock.remove();
    });
}
