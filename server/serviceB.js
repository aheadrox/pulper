var config = require('./config.js');
var broker = require('./broker.js');
var http = require('http');
var url = require('url');

broker.receive('request', function(data, message, channel) {
    var parsed = url.parse(data.url),
        messageUid = message.properties.correlationId;

    console.log(' [<] Got message %s', messageUid);
    console.log(' [+] Sending %s to %s', data.method, data.url);

    parsed.method = data.method;
    parsed.headers = data.headers;

    var req = http.request(parsed, function(res) {
        /** Collects response payload */
        var body = "";
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            console.log(' [>] Got %s from %s', res.statusCode, data.url);
            console.log(' [>] Sending back as %s', messageUid);
            broker.process({
                uuid: messageUid,
                routingKey: 'response.' + url.parse(data.url).hostname,
                payload: {
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body,
                    url: data.headers['x-callback-url'],
                    _original: data
                }
            });
            channel.ack(message);
        })
    });

    req.on('error', function(e) {
        console.log("Problem with the request: " + e.message);
    });

    // write data to request body
    req.write(data.body);
    req.end();
});