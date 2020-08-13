const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

module.exports = [
    new Dotenv(),
    // new ForkTsCheckerWebpackPlugin(),
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
