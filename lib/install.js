var PATH = require("path");
var Q = require("q");
var fs = require("fs");
var exec = require("./exec");

/**
 * Returns the type of the version string. One of:
 * - cwd, the current working directory
 * - git, a git hash or ref
 * - npm, an npm tag
 * @param  {string} version The version string.
 * @return {string}         "cwd", "git" or "npm"
 */
function versionType(version) {
    var first = version.charAt(0);
    return  first === "." ? "fs" : first === "#" ? "git" : "npm";
}

/**
 * Installs the named project based on the version string in the specified
 * directory.
 * @param  {string}  name    Project name.
 * @param  {string}  version The version string.
 * @param  {string}  dir     The directory of the package to install in.
 * @return {Promise}         Promise which will resolve when the package has
 *                           been installed.
 */
module.exports = function install(name, version, dir) {
    var type = versionType(version),
        arg;

    if (type === "fs") {
        arg = PATH.join(process.cwd(), version);
    } else if (type === "git") {
        arg = "git://github.com/montagejs/" + name + ".git" + version;
    } else if (type === "npm"){
        arg = name + "@" + version;
    }

    return exec("npm", ["install", "-q", arg], dir);
};
