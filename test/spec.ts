import { ElectronApplication, _electron as electron, ConsoleMessage, Page, BrowserContext } from 'playwright';
import { expect, test } from '@playwright/test';
import path from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import getRoute from './utilities/getRoute';
import getRandomNode from './utilities/getRandomNode';

// Store the Electron app so we can use it in tests
let app: ElectronApplication;
let tempDirectory: string;
let page: Page;
let context: BrowserContext;

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
            `--app-data-path=${tempDirectory}`,
        ],
    });

    context = app.context();
    await context.tracing.start({ screenshots: true, snapshots: true });
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
    await page.screenshot();

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
test.afterAll(async ({ locale }, testInfo) => {
    const tracePath = testInfo.outputPath('trace.zip');
    await context.tracing.stop({ path: tracePath });

    // Close the app first
    await app.close();

    // Then attempt to remove the temporary directory
    try {
        await rm(tempDirectory, { recursive: true, force: true });
    } catch (err) {
        // GUARD: Check for EPERM and ENOTEMPTY errors. These pop up from time
        // to time on Windows. Since most tests are conducted on CI anyway, if
        // removing the directory fails, we just assume someone else will clean
        // it up 🤷‍♂️🧹
        if (err?.code === 'EPERM' || err?.code === 'ENOTEMPTY') {
            // Ignore the error
        } else {
            // Propagate the error
            throw err;
        }
    }
});

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

});

test('it can successfully create an open data request account', async () => {
    // Navigate to page
    await page.click('a >> text=Accounts');
    await page.waitForLoadState();

    // Define locators for accounts
    const emailAccounts = page.locator('#email-accounts > *');
    const automatedAccounts = page.locator('#automated-accounts > *');

    // There should not be any accounts
    await expect(await emailAccounts.count()).toBe(0);
    await expect(await automatedAccounts.count()).toBe(0);

    // Attempt to create a new account
    const input = page.locator('#modal input[type=url]');
    const submitButton = page.locator('#modal button >> text=Add new open data rights account');
    const odrDemoUrl = 'https://demo.open-data-rights.org';
    await page.click('button >> text=Add New Account');
    await page.click('button >> text=open data rights');
    await expect(input).toBeVisible();
    await expect(input).toBeEditable();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    await input.fill(odrDemoUrl);
    await expect(input).toHaveValue(odrDemoUrl);
    await expect(submitButton).toBeEnabled();
    
    // Wait for the Open Data Rights screen to open up and then capture it
    const [odrPage] = await Promise.all([
        app.waitForEvent('window'),
        submitButton.click(),
    ]);
    await odrPage.waitForLoadState();
    const proceedButton = odrPage.locator('a >> text=Give Aeon access');
    await expect(proceedButton).toBeVisible();
    await expect(proceedButton).toBeEnabled();
    await proceedButton.click();
    await page.waitForLoadState();

    // The account should now exist and be ready to go
    await page.waitForSelector('#automated-accounts > *:first-child');
    await expect(await emailAccounts.count()).toBe(0);
    await expect(await automatedAccounts.count()).toBe(1);

});

test('it can successfully initiate an open data requests request', async () => {
    // Navigate to page
    await page.click('a >> text=Accounts');
    await page.waitForLoadState();
    
    // First, open the account
    const automatedAccounts = page.locator('#automated-accounts > *');
    const startRequest = page.locator('button >> text=Start Data Request');
    const completeRequest = page.locator('button >> text=Complete Data Request');
    await expect(await automatedAccounts.first().textContent()).toContain('No data requested yet');
    await automatedAccounts.first().click();

    // Then, start the request
    await expect(startRequest).toBeVisible();
    await expect(startRequest).toBeEnabled();
    await startRequest.click(),
    await expect(startRequest).toBeDisabled();
    await page.waitForSelector('button >> text=Complete Data Request');
    await expect(completeRequest).toBeVisible();
    await expect(completeRequest).toBeDisabled();
    await expect(await automatedAccounts.first().textContent()).toContain('Requested data less than a minute ago');
});

test('it can successfully complete an open data rights requests request', async () => {
    // Navigate to page
    await page.click('a >> text=Accounts');
    await page.waitForLoadState();

    // Check if the refresh-button is right
    const refresh = page.locator('button >> text=Refresh Requests');
    await expect(refresh).toBeVisible();
    await expect(refresh).toBeEnabled();

    // Then click it
    await Promise.all([
        refresh.click(),
        page.waitForSelector('span >> text=Received data less than a minute ago'),
    ]);
});

test('it can successfully show timeline for a completed request', async () => {
    // Navigate to page
    await page.click('a >> text=Timeline');
    await page.waitForLoadState();
    
    // Expect a single commit
    const commits = page.locator('[data-tour=timeline-commits-list] > *');
    const commit = commits.first();
    await expect(commits).toHaveCount(2);
    await expect(commit).toBeVisible();
    await expect(commit).toBeEnabled();
    await commit.click();
});

test('it can successfully show data for a completed request', async () => {
    // Navigate to page
    await page.click('a >> text=Data');
    await page.waitForLoadState();

    // Check the categories and find a random one
    const categories = page.locator('[data-tour=data-categories-list] a');
    const category = await getRandomNode(categories);
    await expect(await categories.count()).toBeGreaterThan(0);
    await expect(category).toBeEnabled();
    await category.click();
    
    // Check the data points and find a random one
    const data = page.locator('a[data-tour=data-data-point-button]');
    const datum = await getRandomNode(data);
    await expect(await data.count()).toBeGreaterThan(0);
    await expect(datum).toBeEnabled();
    await datum.click();

    // Expect the delete data point button to be there
    const deleteButton = page.locator('button >> text=Delete this data point');
    const menuItems = page.locator('#menu > *');
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeEnabled();
    await expect(menuItems).toHaveCount(5);
    await deleteButton.click();
    await expect(menuItems).toHaveCount(6);
    await expect(deleteButton).toBeDisabled();
});

test('it can erase data points', async () => {
    // Navigate to a datum and erase it
    await page.click('a >> text=Data');
    await page.waitForLoadState();
    await (await getRandomNode(page.locator('[data-tour=data-categories-list] a'))).click();
    await (await getRandomNode(page.locator('a[data-tour=data-data-point-button]'))).click();
    await page.locator('button >> text=Delete this data point').click();

    // Navigate to page 
    await page.click('a >> text=Erasure (1)');
    await page.waitForLoadState();

    // Check that everything's there
    const remove = page.locator('#modal button >> text=Remove 1 data point');
    const reset = page.locator('#modal button >> text=Reset removed data points');
    const send = page.locator('#modal button >> text=Send in e-mail client');
    await expect(remove).toBeVisible();
    await expect(reset).toBeVisible();
    await expect(remove).toBeEnabled();
    await expect(reset).toBeEnabled();
    await remove.click();
    await expect(send).toBeVisible();
    await expect(send).toBeEnabled();
    await page.click('#modal button[data-telemetry-id=modal-close]');

    // See if we can actually reset the removed data points
    const menuItems = page.locator('#menu > *');
    await expect(menuItems).toHaveCount(6);
    await page.click('a >> text=Erasure (1)');
    await page.waitForLoadState();
    await reset.click();
    await expect(menuItems).toHaveCount(5);
});