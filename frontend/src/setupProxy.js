const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('Setting up proxy middleware');
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3002', // Changed to 3002
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api'
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.url);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      }
    })
  );
}; 