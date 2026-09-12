const server = require('../server');
const handler = server.handler || server;

module.exports = (req, res) => {
  if (typeof handler === 'function' && handler !== server) {
    return handler(req, res);
  }
  return server.emit('request', req, res);
};
