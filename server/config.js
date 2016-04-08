var consts = require('./consts.js');

module.exports = {

    /**
     * Server connection string
     */
    server: {
        host: '0.0.0.0',
        port: process.env.PORT || 3000,
        mode: process.env.MODE
    },

    /**
     * Url to which serviceA should report on successful delivery
     * If empty, service looks for X-CALLBACK-URL header in request message
     */
    callbackUrl: process.env.CALLBACK_URL || '',
    callbackMethod: process.env.CALLBACK_METHOD || 'GET',

    /**
     * AMQP connection string
     * Currently tested and supported only RabbitMQ server
     *
     * @type {*|string}
     */
    amqp: {
        exchange: process.env.AMQP_EXCHANGE || 'proxy',
        connection: process.env.AMQP_CONNECTION ||
            'amqp://guest:guest@127.0.0.1//'
    }

};

// fix work mode if it's incorrect
if (Object.keys(consts.MODE).indexOf(module.exports.server.mode) === -1) {
    module.exports.server.mode = consts.MODE.serviceA;
}
