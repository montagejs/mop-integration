#!/usr/bin/env node

var spawn = require("child_process").spawn;
var FS = require("q-io/fs");
var PATH = require("path");
var Q = require("q");

var exec = require("./lib/exec");
var install = require("./lib/install");
var fixturesFor = require("./lib/fixtures-for");
var serve = require("./lib/serve");
var phantom = require("./lib/phantom");
var run = require("./lib/run-page");

global.DEBUG = process.env.DEBUG === "true";
var TIMEOUT = 10000;

var MOP_VERSION = process.env.MOP_VERSION,
    MR_VERSION = process.env.MR_VERSION,
    MONTAGE_VERSION = process.env.MONTAGE_VERSION;

if (!MOP_VERSION) {
    throw new Error("MOP_VERSION must be set");
}
if (MR_VERSION && MONTAGE_VERSION) {
    throw new Error("MR_VERSION amd MONTAGE_VERSION may not be set at the same time");
}
if (!MR_VERSION && !MONTAGE_VERSION) {
    throw new Error("One of MR_VERSION amd MONTAGE_VERSION must be set");
}

var projectName, projectVersion;
if (MR_VERSION) {
    projectName = "mr";
    projectVersion = MR_VERSION;
} else {
    projectName = "montage";
    projectVersion = MONTAGE_VERSION;
}

console.log("Testing mop and " + projectName);

// install Mop
install("mop", MOP_VERSION)
.then(function (mopLocation) {
    console.log("Using mop " + MOP_VERSION + " in " + mopLocation);
    return require(PATH.join(mopLocation));
})
.then(function (optimize) {
    // install Mr/Montage
    // Get fixtures depending on runtime
    return Q.all([install(projectName, projectVersion), fixturesFor(projectName)])
    .spread(function (projectLocation, fixtures) {
        console.log("Using " + projectName + " " + projectVersion + " in " + projectLocation);

        return makeMockTree(FS, projectLocation)
        .then(function (files) {
            var tree = {};
            // put files in `node_modules/projectName` directory
            tree[PATH.join("node_modules", projectName)] = files;

            // lets run those fixtures in a mock fs
            return fixtures.reduce(function (previous, location) {
                return previous.then(function () {
                    return FS.mock(location);
                })
                .then(function (fixtureFs) {
                    // Mix in Mr/Montage package
                    fixtureFs._init(tree);
                    return test(optimize, PATH.basename(location), fixtureFs);
                });
            }, Q());
        });
    });
})
.done();

function makeMockTree(fs, root) {
    return Q.when(fs.listTree(root), function (list) {
        var tree = {};
        return Q.all(list.map(function (path) {
            var actual = fs.join(root, path);
            var relative = fs.relativeFromDirectory(root, actual);
            return Q.when(fs.stat(actual), function (stat) {
                if (stat.isFile()) {
                    return Q.when(fs.read(path, "rb"), function (content) {
                        tree[relative] = content;
                    });
                }
            });
        })).then(function () {
            return tree;
        });
    });
}

function test(optimize, name, fs) {
    console.log("Running Mop on " + name);

    var config = {
        fs: fs,
        // If debug pass undefined so we get default output, otherwise disable
        out: global.DEBUG ? void 0 : {}
    };

    return optimize("/", config)
    .then(function (buildPath) {
        var value = serve(fs, buildPath),
            server = value[0],
            url = value[1];
        return phantom().then(function (browser) {
            return run(browser, url + "index.html")
            .finally(function () {
                server.stop();
                browser.quit().done();
            });
        });
    })
    .then(function (error) {
        console.log("error", error);
        console.log("done with", name);
    });
}
