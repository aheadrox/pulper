var config = require('./config.js');
var broker = require('./broker.js');
var request = require('request');
var url = require('url');

broker.receive('request', function(data, message, channel) {
    var messageUid = message.properties.correlationId,
        options = {
            method: data.method,
            url: data.url,
            headers: data.headers,
            body: data.body
        };

    console.log(' [<] Got message %s', messageUid);
    console.log(' [+] Sending %s to %s', data.method, data.url);

    request(options, function(error, response, body) {
        if (error) {
            console.log(" [!] Problem with the request: " + error);
            return;
        }
        console.log(' [>] Got %s from %s', response.statusCode, options.url);
        console.log(' [>] Sending back as %s', messageUid);
        broker.process({
            uuid: messageUid,
            routingKey: 'response.' + url.parse(options.url).hostname,
            payload: {
                statusCode: response.statusCode,
                headers: response.headers,
                body: body,
                url: options.headers['x-callback-url'],
                _original: data
            }
        });
        channel.ack(message);
    });
});