#!/usr/bin/env node

var spawn = require("child_process").spawn;
var FS = require("q-io/fs");
var PATH = require("path");
var Q = require("q");
require('colors');

var exec = require("./lib/exec");
var install = require("./lib/install");
var fixturesFor = require("./lib/fixtures-for").fixturesFor;
var test = require("./lib/test");

process.on('uncaughtException', function (error) {
    console.error("uncaughtException", error);
    console.error("stack", error.stack);
    throw error;
});

// FIXME: Q 0.9.6 uses process.nextTick and exceeds the maxTickDepth when
// mopping Montage. As a temporary fix increase the limit.
// Remove when Q uses setImmediate instead.
process.maxTickDepth = 5000;

global.DEBUG = process.env.DEBUG === "true";
var TIMEOUT = 10000;

var MOP_VERSION = process.env.MOP_VERSION,
    MR_VERSION = process.env.MR_VERSION,
    MONTAGE_VERSION = process.env.MONTAGE_VERSION;

if (!MOP_VERSION) {
    throw new Error("MOP_VERSION must be set");
}
if (MR_VERSION && MONTAGE_VERSION) {
    throw new Error("MR_VERSION and MONTAGE_VERSION may not be set at the same time");
}
if (!MR_VERSION && !MONTAGE_VERSION) {
    throw new Error("One of MR_VERSION and MONTAGE_VERSION must be set");
}

var projectName, projectVersion;
if (MR_VERSION) {
    projectName = "mr";
    projectVersion = MR_VERSION;
} else {
    projectName = "montage";
    projectVersion = MONTAGE_VERSION;
}

function buildMockTree() {
    return install(projectName, projectVersion).then(function (packageLocations) {
        console.log("Using " + projectName + " " + projectVersion + " in " + packageLocations[0]);
        var tree = {};
        return packageLocations.reduce(function (previous, packageLocation) {
            return previous.then(function () {
                var packageName = PATH.basename(packageLocation);
                return FS.reroot(packageLocation).then(function (fs) {
                    return fs.toObject();
                }).then(function (files) {
                    // Add the package into the new tree's node_modules
                    tree[PATH.join("node_modules", packageName)] = files;
                });
            });
        }, Q()).then(function () {
            return tree;
        });
    });
}

console.log("Testing mop and " + projectName);

// install Mop
install("mop", MOP_VERSION)
.then(function (packageLocations) {
    var mopLocation = packageLocations[0];
    console.log("Using mop " + MOP_VERSION + " in " + mopLocation);
    return require(PATH.join(mopLocation));
})
.then(function (optimize) {
    // install Mr/Montage
    // Get fixtures depending on runtime
    return Q.all([buildMockTree(), fixturesFor(projectName)])
    .spread(function (tree, fixtures) {
        var failed = false;
        // lets run those fixtures in a mock fs
        return fixtures.reduce(function (previous, location) {
            var name = PATH.basename(location);
            return previous.then(function () {
                return FS.mock(location);
            })
            .then(function (fixtureFs) {
                // Mix in Mr/Montage package
                fixtureFs._init(tree);
                return test(optimize, projectName, name, fixtureFs);
            })
            .then(function (errorMessages) {
                if (errorMessages && errorMessages.length !== 0) {
                    console.log((name + " failed: \n" + errorMessages.join('\n')).red);
                    failed = true;
                } else {
                    console.log((name + " passed").green);
                }
                console.log();
            });
        }, Q())
        .then(function () {
            if (failed) {
                throw new Error("Test failed");
            }
        });
    });
}).catch(function (err) {
    console.log(err);
    process.exit(1);
});
