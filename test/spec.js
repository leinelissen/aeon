const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {
    this.timeout(20000)
    
    beforeEach(async function () {
        this.app = new Application({
            // Your electron path can be any binary
            // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
            // But for the sake of the example we fetch it from our node_modules.
            path: electronPath,
            requireName: 'electronRequire',
            
            // Assuming you have the following directory structure
            
            //  |__ my project
            //     |__ ...
            //     |__ main.js
            //     |__ package.json
            //     |__ index.html
            //     |__ ...
            //     |__ test
            //        |__ spec.js  <- You are here! ~ Well you should be.
            
            // The following line tells spectron to look and use the main.js file
            // and the package.json located 1 level above.
            args: [path.join(__dirname, '..', '.webpack', 'main', 'index.js')],
            env: { NODE_ENV: 'test' },
        });
        await this.app.start();
        await this.app.client.pause(1000);
    });
    
    afterEach(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    });
    
    it('load the initial window', async function () {
        const windowCount = await this.app.client.getWindowCount();
        assert.equal(windowCount, 1);
        
        const logs = await this.app.client.getRenderProcessLogs();

        logs.forEach(function (log) {
            assert.notEqual(log.level, 'SEVERE', 'FATAL ERROR: ' + JSON.stringify(log));
            console.log(log.message)
            console.log(log.source)
            console.log(log.level)
        });
    });


});