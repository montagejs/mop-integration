var Q = require("q");

var TIMEOUT = 20000;

/**
 * Opens a page in the browser and waits for `window.done` to be set to true.
 * Returns the value of window.error (which may be undefined).
 *
 * @param  {wd} browser         The browser from wd.js
 * @param  {string} url         The URL to open.
 * @return {Promise<Object>}    The value of `window.error`.
 */
module.exports = function runPage(browser, url) {
    var POLL_TIME = 250;

    return browser.get(url)
    .then(function () {
        var done = Q.defer();

        var poll = function() {
            browser.execute("return window.done").then(function (isDone) {
                if (isDone) {
                    done.resolve();
                } else {
                    setTimeout(poll, POLL_TIME);
                }
            }, done.reject);
        };
        poll();

        return done.promise;
    })
    .then(function () {
        return browser.execute("return window.error");
    })
    .timeout(TIMEOUT, "Timeout waiting for window.done");
};
