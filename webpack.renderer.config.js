const path = require('path');
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
    test: /\.(woff|woff2)$/,
    use: [{
        loader: 'file-loader',
        options: {
            outputPath: 'static',
            name: '[name].[hash].[ext]',
            publicPath: 'static',
        }
    }],
});

rules.push({
    test: /\.css$/,
    use: [{ 
        loader: 'style-loader', 
        options: { attrs: { nonce: 'devOnly' } } 
    }, { 
        loader: 'css-loader',
    }],
});

module.exports = {
    module: {
        rules,
    },
    plugins: plugins,
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
        alias: {
            app: path.resolve(__dirname, 'src', 'app'),
        }
    },
    devtool: "inline-source-map",
};
