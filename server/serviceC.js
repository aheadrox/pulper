var consts = require('./consts.js');
var config = require('./config.js');
var broker = require('./broker.js');
var request = require('request');
var url = require('url');
var validUrl = require('valid-url');

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
        channel.ack(message);
        return;
    }

    options.url = options.url.replace('%uid%', messageUid);

    if (!validUrl.isWebUri(options.url)) {
        console.log(' [!] Url "%s" is not valid. Wiping out...', options.url);
        channel.ack(message);
        return;
    }

    console.log(' [+] Sending to %s %s', options.method ,options.url);
    request(options, function(error, response) {
        if (error) {
            setTimeout(function() {
                channel.nack(message);
            }, consts.TIMEOUT_NACK);
            console.log(" [!] Problem with the request: " + error);
            return;
        }
        console.log(' [>] Got %s from %s', response.statusCode, options.url);
        channel.ack(message);
    });
});