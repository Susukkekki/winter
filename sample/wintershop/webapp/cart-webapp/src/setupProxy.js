const {createProxyMiddleware} = require('http-proxy-middleware')

module.exports = function(app) {
    app.use(createProxyMiddleware(
        '/api/v1/product', 
        {
            target: 'http://127.0.0.1:8001', changeOrigin: true
        }
    ));
    app.use(createProxyMiddleware(
        '/api/v1/cart', 
        {
            target: 'http://127.0.0.1:8002', changeOrigin: true
        }
    ));
}