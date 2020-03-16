import crypto from 'crypto';
import fs from 'fs';
import { PromiseFsClient } from 'isomorphic-git';

const ALGORITHM = 'aes-256-cbc';

class CryptoFs {
    private key?: Buffer = null;

    constructor(password: string) {
        this.key = crypto.createHash('sha256').update(password).digest();
    }

    init(): PromiseFsClient {
        return {
            ...fs,
            promises: {
                ...fs.promises,
                writeFile: this.writeFile,
                readFile: this.readFile,
            }
        }
    }

    public writeFile = (filepath: string, data: Uint8Array, opts?: {}): Promise<any> => {
        return new Promise((resolve, reject) => {
            // Initialise the stream
            const stream = fs.createWriteStream(filepath);
            stream.on('error', reject);
    
            // Create the encryption variables
            const initVect = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(ALGORITHM, this.key, initVect);
            const cipheredContents = Buffer.concat([ initVect, cipher.update(data), cipher.final() ]);
    
            // Pipe output to file
            stream.write(cipheredContents, resolve);
            stream.end();
        })
    }

    public readFile = (filepath: string, opts: { encoding?: string } = {}): Promise<string | Buffer> => {
        return fs.promises.readFile(filepath)
            .then((data: Buffer) => {
                // Retrieve the initialisation vector from the first sixteen bytes
                const initVect = data.slice(0, 16);
                const encrypted = data.slice(16);

                // Initialise the decipherer
                const decipher = crypto.createDecipheriv(ALGORITHM, this.key, initVect);
                const result = Buffer.concat([ decipher.update(encrypted), decipher.final() ]);
                
                return opts.encoding ? result.toString(opts.encoding) : result;
            });

    }
}

export default CryptoFs;