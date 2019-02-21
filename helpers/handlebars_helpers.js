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
    }
}