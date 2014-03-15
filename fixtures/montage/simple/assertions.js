var Q = require("q");
var path = require("path");

exports.shouldTestInBrowser = false;

exports.run = function (fs, buildPath) {
    return Q.all([
        fs.stat(path.join(buildPath))
        .then(function (stat) {
            if (!stat.isDirectory()) {
                return "Build directory not created";
            }
        })
    ]);
};
