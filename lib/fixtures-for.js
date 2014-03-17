var FS = require("q-io/fs");
var PATH = require("path");

exports.fixturesFor = function fixturesFor(project) {
    var dir = pathFor(project);
    return FS.list(dir)
    .then(function (names) {
        return names.map(function (name) { return pathFor(project,name); });
    });
};

var pathFor = exports.fixturePathFor = function pathFor(project, name) {
    if(name) {
        return PATH.join(__dirname, "..", "fixtures", project, name);
    } else {
        return PATH.join(__dirname, "..", "fixtures", project);
    }
};
