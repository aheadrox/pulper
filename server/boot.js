/**
 * Doesn't look safe, but it is, actually, because we check
 * values in config.js if they're allowed
 */
require('./' + require('./config.js').server.mode + '.js');