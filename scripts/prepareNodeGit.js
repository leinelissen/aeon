const path = require('path');
const fs = require('fs');

const debugPath = path.join(__dirname, '..', 'node_modules', 'nodegit', 'build', 'Debug');

fs.promises.mkdir(debugPath, { recursive: true })
    .then(() => {
        return fs.promises.writeFile(path.join(debugPath, 'nodegit.node'), '');
    });