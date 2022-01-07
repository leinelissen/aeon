// Retrieve environment sychronously from main
const env = window.api.env;

// Destructure all individual options
export const {
    appDataPath,
    autoUpdates,
    repositoryPath,
    logPath,
    storePath,
    tour,
    parserInspector,
    isDevelopment,
} = env;

// DEPRECATED: Support the legacy demoMode variable
export const demoMode = false;

export default env;