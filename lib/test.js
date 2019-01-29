var PATH = require("path");
var serve = require("./serve");
var phantom = require("phantom-wd");
var run = require("./run-page");
var fixturePathFor = require("./fixtures-for").fixturePathFor;

module.exports = function test(optimize, projectName, name, fs, dir) {
    console.log("Running Mop on " + name);

    var config = {
        fs: fs,
        // If debug pass undefined so we get default output, otherwise disable
        out: global.DEBUG ? void 0 : {}
    };

    return optimize(dir, config)
    .then(function (buildPath) {
        var assertionsPath = PATH.join(dir, "assertions.js");
        return fs.exists(assertionsPath)
        .then(function (exists) {
            if(exists) {
                return fs.stat(assertionsPath)
                .then(function (stat) {
                    if (stat.isFile()) {
                        var assertions = require(PATH.join(fixturePathFor(projectName, name), "assertions"));
                        return assertions.run(fs, buildPath)
                        .then(function (errorMessages) {
                            return [assertions, errorMessages];
                        });
                    }
                });
            } else {
                return [];
            }
        })
        .spread(function (assertions, errorMessages) {
            errorMessages = errorMessages ? filterErrors(errorMessages) : [];
            if(!assertions || assertions.shouldTestInBrowser) {
                var value = serve(fs, buildPath),
                    server = value[0],
                    url = value[1];
                return phantom().then(function (browser) {
                    return run(browser, url + "index.html")
                    .finally(function () {
                        server.stop();
                        var quit = browser.quit();
                        // want to show any error messages from shutting down phantom
                        // and also wait until it is done
                        quit.done();
                        return quit;
                    });
                })
                .then(function (quitMessage) {
                    if (quitMessage) {
                        errorMessages.push(quitMessage);
                    }
                    return errorMessages;
                });
            } else {
                return errorMessages;
            }
        });
    });
};

function filterErrors (errorMessages) {
    return errorMessages.filter( function (value) {
        return typeof value !== "undefined";
    });
}
