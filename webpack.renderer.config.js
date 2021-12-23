const path = require('path');
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

rules.push({
    test: /\.(woff|woff2|svg)$/,
    sideEffects: true,
    type: 'asset/resource'
});

rules.push({
    test: /\.css$/,
    sideEffects: true,
    use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
            publicPath: "../",
        }
    }, 'css-loader'],
});

module.exports = {
    module: {
        rules,
    },
    devServer: {
        hot: true,
    },
    plugins: [
        ...plugins,
        new MiniCssExtractPlugin({
            filename: "assets/[name].css",
        }),
        isDevelopment && new ReactRefreshWebpackPlugin({
            esModule: true,
        })
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
        alias: {
            app: path.resolve(__dirname, 'src', 'app'),
            main: path.resolve(__dirname, 'src', 'main'),
        }
    },
    // devtool: 'source-map',
};
