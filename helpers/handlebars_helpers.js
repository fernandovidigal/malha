module.exports = {

    checkAdmin: function(status, options){
        if(status == 1){
            return options.fn(this).replace(new RegExp(' name="status"'), '$&checked');
        } else {
            return options.fn(this);
        }
    },

    adminNav: function(status, options) {
        if(status == 1){
            return options.fn(this).replace(new RegExp(' name="status"'), '$&checked');
        }
    },

    sexo: function(sexo){
        if(sexo == 0){
            return 'Feminino';
        } else {
            return 'Masculino';
        }
    },

    sexoChecked: function(sexo, options) {
        return options.fn(this).replace(new RegExp(' value=\"' + sexo + '\"'), '$&checked');
    },

    sexoSelect: function(sexo, options) {
        if(sexo == 1) { // MASCULINO
            return options.fn(this).replace(new RegExp(' class="option_btn"><i class="fa fa-male"></i>Masculino'),  'class="option_btn option_btn__selected"><i class="fa fa-male"></i>Masculino');
        } else if(sexo == 0) { // FEMININO
            return options.fn(this).replace(new RegExp(' class="option_btn"><i class="fa fa-female"></i>Feminino'),  'class="option_btn option_btn__selected"><i class="fa fa-female"></i>Feminino');
        } else { // TODOS
            return options.fn(this).replace(new RegExp(' class="option_btn"><i class="fa fa-users"></i>Todos'),  'class="option_btn option_btn__selected"><i class="fa fa-users"></i>Todos');
        }
    },

    escaloes: function(escalao_id, designacao, sexo, escalao) {
        if(escalao == sexo) {
            return '<input type="radio" name="escalao" value="'+escalao_id+'">'+designacao;
        }
    }
}