var Montage = require("montage");

exports.Test = Montage.create(Montage, {

    draw: {
        value: function () {
            if (this.pass !== true) {
                window.error = "pass was not set to true";
            }
            window.done = true;
        }
    }

});
