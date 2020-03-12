const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
    test: /\.css$/,
    use: [{ loader: 'style-loader', options: { attrs: { nonce: 'devOnly' } } }, { loader: 'css-loader' }],
});

module.exports = {
    module: {
        rules,
    },
    plugins: plugins,
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
    },
    devtool: "inline-source-map",
};
