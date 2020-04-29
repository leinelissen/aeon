const path = require('path');
const rules = require('./webpack.rules')('tsconfig.renderer.json');
const plugins = require('./webpack.plugins');

rules.push({
    test: /\.(woff|woff2|svg)$/,
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
    }, { 
        loader: 'css-loader',
    }],
});

module.exports = {
    module: {
        rules,
    },
    node: { 
        global: true, 
    },
    plugins: plugins,
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
        alias: {
            app: path.resolve(__dirname, 'src', 'app'),
            main: path.resolve(__dirname, 'src', 'main'),
        }
    },
    devtool: "inline-source-map",
};
