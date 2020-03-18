const [ Dotenv ] = require('./webpack.plugins');

module.exports = {
    /**
    * This is the main entry point for your application, it's the first file
    * that runs in the main process.
    */
    entry: {
        index: './src/main/index.ts', 
        preload: './src/app/preload.ts',
    },
    output: {
        filename: '[name].js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
    },
    plugins: [
        Dotenv,
    ],
};