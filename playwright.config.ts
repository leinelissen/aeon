import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

const config: PlaywrightTestConfig = {
    testDir: './test',
    maxFailures: 0,
    outputDir: path.join(__dirname, 'test', 'test-outputs'),
    workers: 1,
    use: {
        screenshot: 'on',
        trace: 'on',
    },
};

export default config;
