var config = require('./config.js');
var broker = require('./broker.js');
var uuid = require('node-uuid');

require('http').createServer(function(req, res) {
    /** Collects request payload */
    var body = "";
    req.on('data', function(chunk) {
        body += chunk;
    });

    /**
     * Sends message to the message broker
     * and returns response to the caller
     */
    req.on('end', function () {
        var xUrl = req.headers['x-url'];
        if (xUrl) {
            broker.process({
                uuid: uuid(),
                routingKey: 'request.' + url.parse(xUrl).hostname,
                payload: {
                    url: xUrl,
                    method: req.method,
                    headers: req.headers,
                    body: body
                }
            });
            res.writeHead(200, 'OK');
        } else {
            res.writeHead(400, 'X-URL header not found');
        }
        res.end();
    });
}).listen(config.server.port, config.server.host, function() {
    console.log(
        config.server.mode + " running at http://" +
        config.server.host + ":" + config.server.port
    );
});