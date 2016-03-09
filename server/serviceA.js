var config = require('./config.js');
var broker = require('./broker.js');
var uuid = require('node-uuid');
var url = require('url');

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
            var messageUid = uuid(),
                host = url.parse(xUrl).hostname,
                headers = req.headers;
            // change the host header
            headers.host = host;
            // send the request to the message broker
            broker.process({
                uuid: messageUid,
                routingKey: 'request.' + host,
                payload: {
                    url: xUrl,
                    method: req.method,
                    headers: headers,
                    body: body
                }
            });
            res.writeHead(200);
            res.end(messageUid);
        } else {
            res.writeHead(400);
            res.end('X-URL header not found');
        }
    });
}).listen(config.server.port, config.server.host, function() {
    console.log(
        config.server.mode + " running at http://" +
        config.server.host + ":" + config.server.port
    );
});