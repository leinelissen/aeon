const os = require('os');
const path = require('path');
const fs = require('fs');
const https = require('https');
const zip = require('zlib');
const tar = require('tar-fs');

/**
 * Encrypting files neccessitate some command-line tools to spawn an encrypted
 * filesystem. We need to make this excessively easy to use if it is to be
 * adopted by users. Therefore, the binaries for at least gocryptfs and its
 * Windows nephew cppcryptfs shall be bundled with the application. Preferably,
 * the installer will install its dependencies as well (Dokany for Windows,
 * OSXFuse for macOS and libfuse for Linux), but this is farther out.
 */

// NOTE: Library versions are hardcoded to ensure consistency in use and testing. These 
// need to be updated in a timely fashion to account for security issues and so forth.
const CPPCRYPTFS_VERISON = '1.4.3.0';
const GOCRYPTFS_VERSION = '1.8.0';

const CPPCRYPTFS_REPOSITORY = 'https://github.com/bailey27/cppcryptfs';
const GOCRYPTFS_REPOSITORY = 'https://github.com/rfjakob/gocryptfs';

const BINARY_PATH = path.join(__dirname, '..', 'bin');
const TEMP_PATH = path.join(os.tmpdir(), `aeon-binaries-`);

/**
 * This function will split between OS'es and retrieve the correct binary from
 * the right source depending on the OS type.
 */
async function getBinary(platform) {
    // Generate a new random directory to store download files in
    const downloadPath = await fs.promises.mkdtemp(TEMP_PATH);

    // Then switch different work between all platforms
    switch(platform) {
        case 'win32': {
            // For windows, we just pull the cppcryptfs binary from the GitHub
            // releases page, and the dump it straight into the bin folder
            const url = `${CPPCRYPTFS_REPOSITORY}/releases/download/${CPPCRYPTFS_VERISON}/cppcryptfs.exe`;
            const destination = path.join(BINARY_PATH, 'cppcryptfs.exe');

            await writeFileToDisk(url, destination);
            return;
        } case 'linux': {
            // For linux, we grab the static tar from the GitHub release page as
            // well, and dump that into the binary folder.
            const url = `${GOCRYPTFS_REPOSITORY}/releases/download/v${GOCRYPTFS_VERSION}/gocryptfs_v${GOCRYPTFS_VERSION}_linux-static_amd64.tar.gz`;
            const archive = path.join(downloadPath, 'gocryptfs.tar.gz');

            await writeFileToDisk(url, archive);
            await unTarGz(archive, downloadPath);
            await fs.promises.rename(
                path.join(downloadPath, 'gocryptfs'), 
                path.join(BINARY_PATH, 'gocryptfs')
            );

            return;
        } case 'darwin': {
            // For macOS, we'll have to grab the Homebrew bottles, as they
            // appear to be the only sources of precompiled binaries for gocryptfs
            const url = `https://homebrew.bintray.com/bottles/gocryptfs-${GOCRYPTFS_VERSION}.mojave.bottle.tar.gz`;
            const archive = path.join(downloadPath, 'gocryptfs.tar.gz');

            await writeFileToDisk(url, archive);
            await unTarGz(archive, downloadPath);
            await fs.promises.rename(
                path.join(downloadPath, 'gocryptfs', GOCRYPTFS_VERSION, 'bin', 'gocryptfs'), 
                path.join(BINARY_PATH, 'gocryptfs')
            );

            return;
        } default:
            throw new Error(`Platform "${os.platform()}" does not support encrypted filesystems. Binary was not downloaded.`);
    }
}

/**
 * Helper function to write a URL to a disk
 * @param {*} url The URL of the file to be downloaded
 * @param {*} destination The destination on disk where the file should be
 * written to
 */
function writeFileToDisk(url, destination) {
    const file = fs.createWriteStream(destination);
    
    return new Promise((resolve, reject) => {
        const request = getRedirectableHttpsResponse(url, response => {
            response.pipe(file);
        });
        file.on('error', reject);
        file.on('finish', resolve);
        request.on('error', reject);
    });
}

/**
 * Helper utility to unzip and untar an archive file
 * @param {*} input The location where the archive is located
 * @param {*} destination The destination folder where the file should be
 * written to
 */
async function unTarGz(input, destination) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(input)
            .on('error', reject)
            .pipe(zip.createUnzip())
            .on('error', reject)
            .pipe(tar.extract(destination))
            .on('finish', resolve);
    });
}

/**
 * A recursive helper that follows redirects for GET requests
 * @param {*} url 
 * @param {*} callback 
 */
function getRedirectableHttpsResponse(url, callback) {
    return https.get(url, response => {
        if (response.statusCode === 302) {
            const location = response.headers.location;
            return getRedirectableHttpsResponse(location, callback);
        }

        callback(response);
    });
}

try {
    getBinary(os.platform());
} catch (err) {
    throw err;
}