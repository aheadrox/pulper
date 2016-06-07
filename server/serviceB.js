var consts = require('./consts.js');
var config = require('./config.js');
var broker = require('./broker.js');
var request = require('request');
var url = require('url');
var validUrl = require('valid-url');

broker.receive('request', function(data, message, channel) {
    var messageUid = message.properties.correlationId,
        options = {
            method: data.method,
            url: data.url,
            headers: data.headers,
            body: data.body
        };

    console.log(' [<] Got message %s', messageUid);

    if (!validUrl.isWebUri(data.url)) {
        console.log(' [!] Url "%s" is not valid. Wiping out...', data.url);
        channel.ack(message);
        return;
    }

    console.log(' [+] Sending %s to %s', data.method, data.url);

    request(options, function(error, response, body) {
        if (error) {
            setTimeout(function() {
                channel.nack(message);
            }, consts.TIMEOUT_NACK);
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