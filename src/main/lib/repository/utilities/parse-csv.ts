import { Blob } from 'nodegit';
import { parse } from '@fast-csv/parse';
import { Readable } from 'stream-chain';

const utfDecoder = new TextDecoder('utf-8');

/**
 * Transforms a nodegit provided CSV blob to an array of objects
 * @param blob 
 */
function parseCsv(blob: Blob): Promise<unknown> {
    // Create readstream from blob
    const readStream = Readable.from(utfDecoder.decode(blob.content()));

    return new Promise((resolve, reject) => {
        // Create holding array for feature headers and rows
        let headers: string[] = [];
        const rows: unknown[] = [];

        // Then setup the parse
        const parser = parse()
            .on('error', reject)
            .on('data', (data: string[]) => {
                // The first piece of data is the header, which we will save appropriately
                if (!headers.length) {
                    headers = data;
                    return;
                }

                // For normal operation, we assign the headers as key names
                const object = data.reduce<Record<string, unknown>>((sum, value, i) => {
                    // GUARD: Skip the loop if the value is empty
                    if (!value) {
                        return sum;
                    }
                    
                    // Retrieve the appropriate key
                    const key = headers[i];

                    // GUARD: If the sum object already contains this key, we
                    // append the value rather than replacing it
                    if (Object.prototype.hasOwnProperty.call(sum, key)) {
                        sum[key] += '; ';
                        sum[key] += value;
                    } else {
                        sum[key] = value;
                    }

                    return sum;
                }, {});

                // Push the resulting object to rows
                rows.push(object);
            })
            .on('end', () => {
                return rows.length > 1
                    ? resolve(rows)
                    : resolve(rows.length === 0 ? {} : rows[0]);
            });
        
        readStream.pipe(parser);
    });
}

export default parseCsv;