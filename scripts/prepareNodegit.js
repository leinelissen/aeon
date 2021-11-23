const path = require('path');
const fs = require('fs');

const debugPath = path.join(__dirname, '..', 'node_modules', 'nodegit', 'build', 'Debug');
const mainEntry = path.join(__dirname, '..', 'node_modules', 'nodegit', 'dist', 'nodegit.js');

// First, we add an empty debug file, so we can satisfy webpack one exists
fs.promises.mkdir(debugPath, { recursive: true })
    .then(() => {
        return fs.promises.writeFile(path.join(debugPath, 'nodegit.node'), '');
    });

// Then we modify the base files to not use dynamic requires
fs.promises.readFile(mainEntry)
    .then((file) => {
        const data = file.toString('utf-8');
        const newData = data.replace(/importExtension\(\"(.*?)\"\);/g, (match, name) => {
            return `try { require('./${name}'); } catch { }`;
        });
        return fs.promises.writeFile(mainEntry, newData);
    })