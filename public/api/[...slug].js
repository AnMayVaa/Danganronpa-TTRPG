// Vercel Serverless Function — delegates ALL /api/* routes to server.js requestHandler
// When Vercel routes /api/rooms/ABC/broadcast -> req.query.slug = ['rooms','ABC','broadcast']
// req.url may be '/rooms/ABC/broadcast' or '/api/rooms/ABC/broadcast' depending on Vercel version
const { handler } = require('../server');

module.exports = (req, res) => {
  // Reconstruct full /api/... path from slug array (Vercel passes slug as query param)
  try {
    const slug = req.query && req.query.slug;
    if (slug) {
      const parts = Array.isArray(slug) ? slug : [slug];
      // Rebuild clean URL: /api/<slug...><?querystring>
      const qs = req.url && req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
      req.url = '/api/' + parts.join('/') + qs;
    } else if (req.url && !req.url.startsWith('/api/')) {
      // Already-reconstructed or missing prefix
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
  } catch(e) {}

  return handler(req, res);
};
