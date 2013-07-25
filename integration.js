#!/usr/bin/env node

/*global describe,it,expect */
var spawn = require("child_process").spawn;
var FS = require("q-io/fs");
var PATH = require("path");
var Q = require("q");

var install = require("./lib/install");
var fixturesFor = require("./lib/fixtures-for");

global.DEBUG = process.env.DEBUG == "true";
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

        return fixtures.map(function (location) {
            return test(PATH.basename(location), location);
        });
    });
})
.done();
// for each fixture
//      copy Mr/Montage
//      Mop
//      Run in phantom/browser
//      report result
/*
describe("mopping", function () {

    describe("Mr", function () {
        [
            "simple",
            "module"
        ].forEach(function (name) {
            it(name, function (done) {
                var self = this;

                var location = PATH.join(__dirname, "fixtures", "mr", name);
                test(name, location, done).
                fail(function (error) {
                    self.fail(error);
                })
                .finally(done);
            }, TIMEOUT * 2);
        });
    });

});

function test(name, location) {
    var buildLocation = PATH.join(location, "builds", name);

    var config = {
        // If debug pass undefined so we get default output, otherwise disable
        out: DEBUG ? void 0 : {}
    };

    return npmSetup(location)
    .then(function () {
        return optimize(location, config);
    })
    .then(function () {
        var value = serve(buildLocation),
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
        expect(error).toBe(null);
    });
}
*/
