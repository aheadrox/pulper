var config = require('./config.js');
var broker = require('./broker.js');
var http = require('http');
var url = require('url');

broker.receive('response', function(data, message, channel) {
    var messageUid = message.properties.correlationId;
    console.log(' [<] Got message %s with status %s',
        messageUid, data.statusCode);

    data.url = data.url || config.callbackUrl;
    if (!data.url) {
        console.log(' [!] Empty data.url and callbackUrl setting - exiting.');
        return;
    }

    data.url = data.url.replace('%uid%', messageUid);

    var parsed = url.parse(data.url);
    parsed.method = data.method;
    parsed.headers = data.headers;

    console.log(' [+] Sending to %s', data.url);
    var req = http.request(parsed, function(res) {
        /** Collects response payload */
        var body = "";
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            console.log(' [>] Got %s from %s', res.statusCode, data.url);
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