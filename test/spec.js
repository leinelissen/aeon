const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {
    this.timeout(60000)
    
    beforeEach(async function () {
        this.app = new Application({
            // Your electron path can be any binary
            // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
            // But for the sake of the example we fetch it from our node_modules.
            path: path.join(__dirname, '..', 'out', 'Aeon-darwin-x64', 'Aeon.app', 'Contents', 'MacOS', 'aeon'),
            // requireName: 'electronRequire',
            
            // The following line tells spectron to look and use the main.js file
            // and the package.json located 1 level above.
            // args: [path.join(__dirname, '..', '.webpack', 'main', 'index.js')],
            env: { NODE_ENV: 'test', ENABLE_ENCRYPTION: false },
            startTimeout: 10000,
            waitTimeout: 10e3,
            // connectionRetryTimeout: 5000,
            chromeDriverLogPath: './chromedriver.log',
            webdriverLogPath: './webdriver.log'
        });
        await this.app.start();
        await this.app.client.pause(1000);
    });
    
    afterEach(async function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    });
    
    it('load the initial window', async function () {
        await Promise.all([
            this.app.client.getRenderProcessLogs(),
            this.app.client.getMainProcessLogs()
        ]).then(([ render, main ]) => {
            render.forEach(function (log) {
                assert.notEqual(log.level, 'SEVERE', 'FATAL ERROR: ' + JSON.stringify(log));
                console.log('[RENDER]', log.message)
            });
            main.forEach((message) => console.log('[MAIN] ', message));
        });

        const windowCount = await this.app.client.getWindowCount().then(() => {
            assert.equal(windowCount, 1);
        });
    });
});