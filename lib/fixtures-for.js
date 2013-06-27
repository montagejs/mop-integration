var FS = require("q-io/fs");
var PATH = require("path");

module.exports = function fixturesFor(project) {
    var dir = PATH.join(__dirname, "..", "fixtures", project);
    return FS.list(dir)
    .then(function (names) {
        return names.map(function (name) { return PATH.join(dir, name); });
    });
};
