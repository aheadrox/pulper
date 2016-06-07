module.exports = {

    /**
     * Work mode
     *
     * @type {{serviceA: string, serviceB: string}}
     */
    MODE: {
        serviceA: 'serviceA',
        serviceB: 'serviceB',
        serviceC: 'serviceC'
    },

    /**
     * Timeout in milliseconds to re-queue a message which wasn't delivered
     */
    TIMEOUT_NACK: 5000

};