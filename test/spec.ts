import { ElectronApplication, _electron as electron, ConsoleMessage, Page } from 'playwright';
import { expect, test } from '@playwright/test';
import path from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import getRoute from './utilities/getRoute';

// Store the Electron app so we can use it in tests
let app: ElectronApplication;
let tempDirectory: string;
let page: Page;

let pageErrors: Error[] = [];
let consoleMessages: ConsoleMessage[] = [];

// Prepare the application by launching it
test.beforeAll(async () => {
    tempDirectory = await mkdtemp(path.join(tmpdir(), 'aeon-'));
    const mainJsPath = path.resolve('.webpack', 'main', 'index.js');

    app = await electron.launch({
        args: [
            mainJsPath,
            '--no-auto-updates',
            '--no-tour',
            `--app-data-path=${tempDirectory}`
        ],
    });
});

test.beforeEach(async () => {
    page = await app.firstWindow();

    // Capture all page errors
    page.on('pageerror', (error) => {
        pageErrors.push(error);
        console.error(error);
    });

    // Capature all console errors
    page.on('console', (message) => {
        consoleMessages.push(message);
        console.log(message.type(), message.text(), message.location());
    });
});

test.afterEach(async () => {
    // Check if there aren't any console errors
    expect(consoleMessages.filter((msg) => msg.type() === 'error').length).toBe(0);
    expect(pageErrors.length).toBe(0);

    // Clear messages after each test
    consoleMessages = [];
    pageErrors = [];

    // Close the window
    await page.reload();

    // Reset the URL
    await page.goto(page.url().split('#')[0]);
});

// Remove the temporary directory after the tests finish
test.afterAll(async () => {
    await rm(tempDirectory, { recursive: true });
});

// Close the app after running all the tests
test.afterAll(() => app.close());

test('it renders all pages', async () => {
    await page.click('a >> text=Timeline');
    await page.click('a >> text=Accounts');
    await page.click('a >> text=Data');
    await page.click('a >> text=Graph');
    await page.click('a >> text=Settings');
});

test('it renders menu items correctly', async () => {
    // Check that the menu items have the correct length
    const menuItems = await page.$$('#menu > *');
    await expect(menuItems.length).toBe(5);

    // Check that all menu items exist
    await expect(page.locator('#menu > * >> nth=0')).toHaveText('Timeline');
    await expect(page.locator('#menu > * >> nth=1')).toHaveText('Accounts');
    await expect(page.locator('#menu > * >> nth=2')).toHaveText('Data');
    await expect(page.locator('#menu > * >> nth=3')).toHaveText('Graph');
    await expect(page.locator('#menu > * >> nth=4')).toHaveText('Settings');
});

test('it renders the timeline correctly', async () => {
    // Navigate to page
    await page.click('a >> text=Timeline');
    await page.waitForLoadState();

    // Expect it to show a button to add first account
    await expect(page.locator('#content a')).toHaveText('Add your first account');

    // Expect the button to navigate to the accounts page
    await page.click('#content a >> text="Add your first account"');
    await expect(getRoute(page)).toBe('/accounts?create-new-account');
});

test('it renders the accounts page correctly', async () => {
    // Navigate to page
    await page.click('a >> text=Accounts');
    await page.waitForLoadState();

    // Check if the buttons are there
    await expect(page.locator('button >> text=Add New Account')).toBeVisible();
    await expect(page.locator('button >> text=Refresh Requests')).toBeVisible();

    // Define locators for accounts
    const emailAccounts = page.locator('#email-accounts > *')
    const automatedAccounts = page.locator('#automated-accounts > *')

    // There should not be any accounts
    expect(await emailAccounts.count()).toBe(0);
    expect(await automatedAccounts.count()).toBe(0);

    // Attempt to create a new account
    await page.click('button >> text=Add New Account');
    await page.click('button >> text=open data rights')
    await expect(page.locator('#modal input')).toBeVisible();
});