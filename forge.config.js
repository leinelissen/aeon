/**
* This is the base electron-forge config
*/
const config = {
    packagerConfig: {
        icon: "./src/icon",
        executableName: "aeon"
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                iconUrl: "https://raw.githubusercontent.com/leinelissen/aeon/master/src/icon.ico",
                setupIcon: "./src/icon.ico"
            }
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: [ "darwin" ]
        },
        {
            name: "@electron-forge/maker-deb",
            config: {}
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {}
        }
    ],
    plugins: [
        [
            "@electron-forge/plugin-webpack",
            {
                mainConfig: "./webpack.main.config.js",
                renderer: {
                    config: "./webpack.renderer.config.js",
                    entryPoints: [
                        {
                            html: "./src/app/index.ejs",
                            js: "./src/app/index.tsx",
                            name: "main_window"
                        }
                    ]
                },
                loggerPort: 9001
            }
        ]
    ],
};

/**
 * This function inserts config for notarizing applications.
 * Idea stolen from: https://github.com/electron/fiddle/blob/master/forge.config.js
 */
function notarizeMaybe() {
    // GUARD: Only notarize macOS-based applications
    if (process.platform !== 'darwin') {
        return;
    }
    
    // Only notarize in CI
    if (!process.env.CI) {
        console.log(`Not in CI, skipping notarization`);
        return;
    }
    
    // GUARD: Credentials are required
    if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
        console.warn(
            'Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!',
        );
        return;
    }
    
    // Inject the notarization config if everything is right
    config.packagerConfig.osxNotarize = {
        appBundleId: 'nl.leinelissen.aeon',
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
        ascProvider: '238P3C58WC',
    };
}

notarizeMaybe();

// Finally, export it
module.exports = config;