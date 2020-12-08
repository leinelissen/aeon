const path = require('path');
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

rules.push({
    test: /\.(woff|woff2)$/,
    sideEffects: true,
    use: [{
        loader: 'file-loader',
        options: {
            outputPath: 'assets',
        }
    }],
}, {
    test: /\.(svg)$/,
    use: [{
        loader: 'file-loader',
        options: {
            outputPath: 'assets',
            publicPath: '../assets',
        }
    }],
});

rules.push({
    test: /\.css$/,
    sideEffects: true,
    use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
            publicPath: "..",
        }
    }, 'css-loader'],
});

module.exports = {
    module: {
        rules,
    },
    node: { 
        global: true, 
    },
    plugins: [
        ...plugins,
        new MiniCssExtractPlugin({
            filename: "assets/[name].css",
        })
    ],
    optimization: {
        usedExports: true,
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
        alias: {
            app: path.resolve(__dirname, 'src', 'app'),
            main: path.resolve(__dirname, 'src', 'main'),
        }
    },
    devtool: 'source-map',
};
