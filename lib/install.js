var PATH = require("path");
var Q = require("q");
var temp = require("temp");
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

function readdirAbs(absDir) {
    return fs.readdirSync(absDir).map(function (child) {
        return PATH.join(absDir, child);
    });
}

/**
 * Installs the named project based on the version string.
 * @param  {string} name    Project name.
 * @param  {string} version The version string.
 * @return {Promise<Array<string>>} Promise for the locations of packages that
 * were installed. With npm 2 this array will only contain the request package
 * since dependencies are installed nested. With npm 3 this array will also
 * contain the requested package's dependencies since they are installed flat.
 */
module.exports = function install(name, version) {
    var type = versionType(version),
        dir, arg, nmDirectory, packages;

    if (type === "fs") {
        dir = PATH.join(process.cwd(), version);
        nmDirectory = PATH.join(dir, "node_modules");
        packages = [dir].concat(readdirAbs(nmDirectory));
        return Q(packages);
    } else if (type === "git") {
        arg = "git://github.com/montagejs/" + name + ".git" + version;
    } else if (type === "npm"){
        arg = name + "@" + version;
    }

    dir = temp.mkdirSync(name);
    return exec("npm", ["install", arg, "-q"], dir)
        .then(function () {
            var nmDirectory = PATH.join(dir, "node_modules");
            var packages = readdirAbs(nmDirectory);
            // Put requested package first
            for (var i = 1; i < packages.length; i++) {
                var pkg = packages[i];
                if (PATH.basename(pkg) === name) {
                    packages[i] = packages[0];
                    packages[0] = pkg;
                }
            }
            return packages;
        });
};
