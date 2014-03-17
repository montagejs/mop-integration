var Q = require("q");
var path = require("path");

exports.shouldTestInBrowser = false;

var APP_BUNDLE_PATH = "index.html.bundle-0.js";

exports.run = function (fs, buildPath) {
    return Q.all([
        fs.stat(path.join(buildPath))
        .then(function (stat) {
            if (!stat.isDirectory()) {
                return "Build directory not created";
            }
        }),
        fs.stat(path.join(buildPath, APP_BUNDLE_PATH))
        .then(function (stat) {
            if (stat.isFile()) {
                return fs.read(path.join(buildPath, APP_BUNDLE_PATH));
            }
        })
        .then(function (content) {
            if(content.indexOf("test_html_content") === -1) {
                return "HTML File not bundled";
            }
        })
    ]);
};
