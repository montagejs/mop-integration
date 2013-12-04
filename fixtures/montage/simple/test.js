var Montage = require("montage").Montage;

exports.Test = Montage.specialize({

    draw: {
        value: function () {
            if (this.pass !== true) {
                window.error = "pass was not set to true";
            }
            window.done = true;
        }
    }

});
