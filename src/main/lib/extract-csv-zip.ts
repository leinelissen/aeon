import fs from 'fs';
import { Entry, open } from 'yauzl';
import path from 'path';
import { parser } from 'stream-csv-as-json';
import { stringer } from 'stream-json/Stringer';
import Chain from 'stream-chain';
import { asObjects } from 'stream-csv-as-json/AsObjects';

/**
 * Will extract a ZIP file containing CSVs, convert them to JSON and them save
 * them in their specified paths.
 * @param zipPath 
 * @param extractionPath 
 */
function extractCsvZip(zipPath: string, extractionPath: string): Promise<Entry[]> {
    return new Promise((resolve, reject) => {
        // Open the ZIP file
        open(zipPath, { lazyEntries: true }, (err, zipfile) => {
            // Reject if we run into any errors
            if (err) reject(err);
            zipfile.on('error', reject);

            // Loop through all entries
            const entries: Entry[] = [];
            zipfile.on('entry', entry => {
                if (/\/$/.test(entry.fileName)) {
                    // Directory file names end with '/'.
                    // Note that entries for directories themselves are optional.
                    // An entry's fileName implicitly requires its parent directories to exist.
                    zipfile.readEntry();
                    return;
                }

                // Save the entry to entries first
                entries.push(entry);

                // Then try to read the stream
                zipfile.openReadStream(entry, (err, readStream) => {
                    // GUARD: Reject any errors
                    if (err) reject(err);

                    // First, we'll determine where the file should end up
                    const entryPath = path.join(extractionPath, entry.fileName.replace('.csv', '.json'));

                    // Then, we'll push the file through the CSV parser and save
                    // it to disk.
                    const chain = new Chain([
                        readStream,
                        parser(),
                        asObjects(),
                        stringer({ makeArray: true }),
                        fs.createWriteStream(entryPath)
                    ]);

                    // When the file finishes, we'll read another entry
                    chain.on('end', () => zipfile.readEntry());
                });
            });

            // When we reach the end of the ZIP, we can resolve the main promise
            zipfile.on('end', () => {
                resolve(entries);
            });

            // Read first entry
            zipfile.readEntry();
        });
    });
}

export default extractCsvZip;