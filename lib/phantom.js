var spawn = require("child_process").spawn;
var Q = require("q");
var wd = require("wd");

/**
 * Starts up PhantomJS with a webdriver interface
 * @return {Promise<wd>} Promise for an initialized browser from wd.js
 */
module.exports = function phantom() {

    var phantomProc = spawn("phantomjs", ["--webdriver=127.0.0.1:8910"], {
        stdio: global.DEBUG ? "inherit" : "ignore"
    });

    var browser = wd.promiseRemote("127.0.0.1", 8910);

    // Kill phantom when the browser is quit
    var originalQuit = browser.quit;
    browser.quit = function () {
        return originalQuit.call(browser)
        .finally(function () {
            phantomProc.kill();
        });
    };

    // wait for Ghost Driver to start running
    return Q.delay(2000)
    .then(function () {
        return browser.init();
    })
    .then(function () {
        return browser;
    });
};
