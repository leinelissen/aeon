import fs, { ReadStream } from 'fs';
import { Entry, open, ZipFile } from 'yauzl';
import path from 'path';
import { parser } from 'stream-csv-as-json';

interface Zipfile {
    entries: Entry[];
    zipfile: ZipFile;
}

/**
 * This function will extract all entries from a given 
 * @param filepath The path to the ZIP file
 */
function getZipEntries(filepath: string): Promise<Zipfile> {
    return new Promise((resolve, reject) => {
        // Open the ZIP file
        open(filepath, { lazyEntries: true }, (err, zipfile) => {
            // Reject if we run into any errors
            if (err) reject(err);
            zipfile.on('error', reject);

            // Loop through all entries
            const entries: Entry[] = [];
            zipfile.on('entry', entry => {
                if (!/\/$/.test(entry.fileName)) {
                    // Directory file names end with '/'.
                    // Note that entries for directories themselves are optional.
                    // An entry's fileName implicitly requires its parent directories to exist.
                    entries.push(entry);
                }

                zipfile.readEntry();
            });

            zipfile.on('end', () => {
                resolve({
                    entries,
                    zipfile
                })
            });

            zipfile.readEntry();
        });
    });
}

/**
 * This function initialises a CSV-aware ReadStream for consumption by other APIs
 * @param entry 
 * @param zipfile 
 */
async function readCsvStream(entry: Entry, zipfile: ZipFile): Promise<ReadStream> {
    // First, we'll initialise the readstream
    const stream = await new Promise<ReadStream>((resolve, reject) => {
        zipfile.openReadStream(entry, (err, readStream: ReadStream) => {
            if (err) reject(err);
            resolve(readStream);
        })
    });

    // Then we add the CSV parser
    stream.pipe(parser());

    return stream;
}

/**
 * Will extract a ZIP file containing CSVs, convert them to JSON and them save
 * them in their specified paths.
 * @param zipPath 
 * @param extractionPath 
 */
async function extractCsvZip(zipPath: string, extractionPath: string): Promise<Entry[]> {
    const { entries, zipfile } = await getZipEntries(zipPath);

    const saves = entries.map(async (entry): Promise<void> => {
        // Retrieve the file stream with CSV parsing
        const stream = await readCsvStream(entry, zipfile)
        
        return new Promise((resolve, reject) => {
            // Setup error and success handler
            stream.on('end', resolve);
            stream.on('error', reject);
            
            // Pipe the stream to the path where the files should be created
            const entryPath = path.join(extractionPath, entry.fileName);
            const writeStream = fs.createWriteStream(entryPath)
            stream.pipe(writeStream);
        });
    });

    // Wait for all streams to finish
    await Promise.all(saves);

    return entries;
}

export default extractCsvZip;