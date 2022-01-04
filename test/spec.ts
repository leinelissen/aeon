import { ElectronApplication, _electron as electron, ConsoleMessage } from 'playwright';
import { expect, test } from '@playwright/test';
import path from 'path';

// Store the Electron app so we can use it in tests
let app: ElectronApplication;

// Prepare the application by launching it
test.beforeAll(async () => {
    const mainJsPath = path.resolve('.webpack', 'main', 'index.js');

    app = await electron.launch({
        args: [mainJsPath, '--auto-updates=false'],
    });
});

// Close the app after running all the tests
test.afterAll(() => app.close());

test('it renders the window', async () => {
    const window = await app.firstWindow();

    // Capture all page errors
    const pageErrors: Error[] = [];
    window.on('pageerror', (error) => {
        pageErrors.push(error);
        console.error(error);
    });

    // Capature all console errors
    const consoleMessages: ConsoleMessage[] = [];
    window.on('console', (message) => {
        consoleMessages.push(message);
        console.log(message);
    });

    // Wait for the page to load and then some more
    await window.waitForLoadState();
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Check if there aren't any console errors
    expect(consoleMessages.filter((msg) => msg.type() === 'error').length).toBe(0);
    expect(pageErrors.length).toBe(0);
});