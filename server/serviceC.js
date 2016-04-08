var config = require('./config.js');
var broker = require('./broker.js');
var request = require('request');
var url = require('url');

broker.receive('response', function(data, message, channel) {
    var messageUid = message.properties.correlationId,
        options = {
            method: data.method || config.callbackMethod,
            url: data.url || config.callbackUrl,
            headers: data.headers,
            body: data.body
        };

    console.log(' [<] Got message %s with status %s',
        messageUid, data.statusCode);

    if (!options.url) {
        console.log(' [!] Empty data.url and callbackUrl setting - exiting.');
        return;
    }

    options.url = options.url.replace('%uid%', messageUid);

    console.log(' [+] Sending to %s %s', options.method ,options.url);
    request(options, function(error, response) {
        if (error) {
            console.log(" [!] Problem with the request: " + error);
            return;
        }
        console.log(' [>] Got %s from %s', response.statusCode, options.url);
        channel.ack(message);
    });
});