// Vercel Serverless Function — delegates ALL /api/* routes to server.js requestHandler
const { handler } = require('../server');

module.exports = (req, res) => {
  // Reconstruct the full path from Vercel slug routing
  // When Vercel routes /api/rooms/ABC/broadcast → slug = ['rooms','ABC','broadcast']
  const slug = req.query && req.query.slug;
  if (slug && Array.isArray(slug)) {
    // Rebuild the clean URL path so server.js route matchers work correctly
    req.url = '/api/' + slug.join('/') + (req.url && req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
  } else if (slug && typeof slug === 'string') {
    req.url = '/api/' + slug + (req.url && req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
  }
  return handler(req, res);
};
