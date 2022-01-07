const [ Dotenv ] = require('./webpack.plugins');
const path = require('path');

module.exports = {
    /**
    * This is the main entry point for your application, it's the first file
    * that runs in the main process.
    */
    entry: './src/main/index.ts',
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
        alias: {
            app: path.resolve(__dirname, 'src', 'app'),
            main: path.resolve(__dirname, 'src', 'main'),
            // We override the call to the debug version of Nodegit, since we are
            // not building it anyways, and webpack trips over the conditional
            // require statement in Nodegit.
            '../build/Debug/nodegit.node': false,
        }
    },
    plugins: [
        Dotenv,
    ],
    // devtool: 'source-map',
};