const Application = require('spectron').Application;
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const getAppPath = () => {
    switch(process.platform) {
        case 'darwin':
            return path.join(__dirname, '..', 'out', 'Aeon-darwin-x64', 'Aeon.app', 'Contents', 'MacOS', 'aeon');
        case 'linux':
        case 'win32':
            return path.join(__dirname)
    }
}

describe('Application launch', function () {
    this.timeout(60000);
    
    beforeEach(async function () {
        this.app = new Application({
            path: getAppPath(),
            env: { NODE_ENV: 'test', IS_TEST: true },
            requireName: 'electronRequire',
            // NOTE: Since the default data directory supplied by Chromium has
            // writing issues, we need to create our own temporary directory, so
            // that we can actually mount encrypted filesystems
            chromeDriverArgs: [
                `--user-data-dir=${path.join(__dirname, '..', 'tmp')}`
            ]
        });
        await this.app.start();
        await this.app.client.pause(2000);
        // await this.app.client.waitUntilWindowLoaded(10000);
    });
    
    afterEach(async function () {
        // Log all messages from the renderer and main process
        await Promise.all([
            this.app.client.getRenderProcessLogs(),
            this.app.client.getMainProcessLogs()
        ]).then(([ render, main ]) => {
            // Log out the renderer logs
            render.forEach((log) => {
                assert.notEqual(log.level, 'SEVERE', 'FATAL ERROR: ' + JSON.stringify(log));
                console.log('[RENDER]', log.message)
            });
            // Log out the main process logs
            main.forEach((message) => console.log('[MAIN] ', message));
        });

        if (this.app && this.app.isRunning()) {
            await this.app.stop();
        }

        // Remove the temp directory
        try {
            await fs.promises.rmdir(path.join(__dirname, '..', 'tmp'), { recursive: true });
        } catch(e) {
            // Ignore any rm errors => we remove any files on a best-effort
            // basis. The directory will be replaced on any next run.
        }
    });
    
    it('load the initial window', async function () {

        const windowCount = await this.app.client.getWindowCount();
        assert.equal(windowCount, 1);
    });
});