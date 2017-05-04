var joey = require("joey");

/**
 * Serves a directory
 * @param  {string} location Path to the directory to serve
 * @return {string}          URL to the server
 */
module.exports = function serve(fs, location) {
    
    var server = joey
    .error(true)
    .fileTree(location, {fs: fs})
    .server();

    server.listen(0).done();

    var serverPort = server.node.address().port;
    var serverUrl = "http://127.0.0.1:" + serverPort + "/";
    if (global.DEBUG) {
        console.log("Serving", location, "at", serverUrl);
    }

    return [server, serverUrl];
};
