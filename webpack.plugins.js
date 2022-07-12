const Dotenv = require('dotenv-webpack');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
 
module.exports = [
    new Dotenv({
        systemvars: true,
    }),
    // new BundleAnalyzerPlugin(),
    new CspHtmlWebpackPlugin({
        'script-src': ["'self'", ...process.env.NODE_ENV !== 'production' ? ["'unsafe-eval'"] : [] ],
        'style-src': ["'self'", "'unsafe-inline'"],
    }, {
        hashEnabled: {
            'script-src': true,
            'style-src': false
        },
        nonceEnabled: {
            'script-src': true,
            'style-src': false
        }
    }),
];
