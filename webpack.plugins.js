const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = [
    new Dotenv(),
    new ForkTsCheckerWebpackPlugin(),
];
