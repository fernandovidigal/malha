
module.exports.helpers = {

    ifCond: function (v1, operator, v2, options) {

        if(v1 == undefined || v1.constructor === Array && v1.length == 0){
            v1 = false;
        }

        if(v2 == undefined || v2.constructor === Array && v2.length == 0){
            v2 = false;
        }

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    },

    sexoSelect: function(sexo, options) {
        if(sexo == 1) { // MASCULINO
            return options.fn(this).replace(' class="option_btn"><i class="fa fa-male"></i>Masculino',  'class="option_btn option_btn__selected"><i class="fa fa-male"></i>Masculino');
        } else if(sexo == 0) { // FEMININO
            return options.fn(this).replace(' class="option_btn"><i class="fa fa-female"></i>Feminino',  'class="option_btn option_btn__selected"><i class="fa fa-female"></i>Feminino');
        } else { // TODOS
            return options.fn(this).replace(' class="option_btn"><i class="fa fa-users"></i>Todos',  'class="option_btn option_btn__selected"><i class="fa fa-users"></i>Todos');
        }
    }
}