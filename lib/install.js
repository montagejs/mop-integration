var PATH = require("path");
var Q = require("q");
var temp = require("temp");
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
    return  first === "." ? "cwd" : first === "#" ? "git" : "npm";
}

/**
 * Installs the named project based on the version string
 * @param  {string} name    Project name.
 * @param  {string} version The version string.
 * @return {Promise<string>}Promise for the location is was installed to (a
 * temporary directory)
 */
module.exports = function install(name, version) {
    var type = versionType(version);

    if (type === "cwd") {
        return Q(PATH.join(process.cwd(), version));
    }

    var arg, dir = temp.mkdirSync(name);
    if (type === "git") {
        arg = "git://github.com/montagejs/" + name + ".git" + version;
    } else if (type === "npm"){
        arg = name + "@" + version;
    }

    return exec("npm", ["install", arg], dir)
    .thenResolve(PATH.join(dir, "node_modules", name));
};
