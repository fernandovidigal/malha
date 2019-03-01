var msgCloseBtn = document.querySelector('.msg_close');

if(msgCloseBtn){
    msgCloseBtn.addEventListener('click', function(e){
        e.preventDefault();
        var msgBlock = this.parentNode;
        msgBlock.remove();
    });
}

var searchSelectBox = document.querySelector('.searchSelectBox');
var searchSelectBox_list = document.querySelector('.searchSelectBox .searchSelectBox__list');


searchSelectBox.addEventListener('click', function(){
    searchSelectBox_list.style.display = 'block';
});
