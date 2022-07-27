const magnum = require('./magic-number');
const fs = require('fs');
const path = require('path');

function readFromBuffer (buf) {
    if (!Buffer.isBuffer(buf)) throw new Error('Must be given a buffer');

    // compare the first bytes against the magic numbers
    const hex = buf.slice(0, (buf.length > 10) ? 10 : buf.length).toString('hex');
    for (let mag in magnum) {
        if (hex.indexOf(mag) === 0) {
            return magnum[mag]
        }
    }

    // convert to string, check the plaintext types
    const asStr = buf.slice(0, (buf.length > 512) ? 512 : buf.length).toString('utf-8').trim();
    if (asStr.indexOf('<svg') !== -1) return 'svg';
    if (asStr.indexOf('<html') !== -1) return 'html';
}

const _dir = process.argv[2];
if (!_dir) {
    console.log('file path must be given');
    process.exit();
}

let mapping = null;

try {
    mapping = require('./mapping.json');
    if (!mapping || mapping == {}) {
        console.log('failed to load mapping');
        process.exit();
    }
    console.log('mapping loaded');
} catch (e) {
    console.log('failed to load mapping', e);
    process.exit();
}

const failed = [];
let count = 0;

try {
    console.log('reading directory...');
    const files = fs.readdirSync(_dir);
    if (!files) throw new Error('no files');
    count = files.length;
    console.log('renaming...');
    files.forEach(fileName => {
        if (fileName.indexOf('.') !== -1) {
            console.warn('already has ext, skipped');
            return;
        }
        try {
            const filePath = path.join(_dir, fileName);
            if (mapping.hasOwnProperty(fileName)) {
                console.log('use mapping');
                const newName = path.join(_dir, `${mapping[fileName]}`);
                fs.renameSync(filePath, newName);
                return;
            }
            console.warn('no mapping found, try guessing...');
            const fileBuffer = fs.readFileSync(filePath);
            const ext = readFromBuffer(fileBuffer);
            if (!ext) throw new Error('cannot recognize ' + fileName);
            const newName = path.join(_dir, `${fileName}.${ext}`);
            fs.renameSync(filePath, newName);
            // console.log(`rename ${fileName} successfully`);
        } catch (e) {
            console.error('failed to rename ' + fileName, e.message);
            failed.push(fileName);
        }
    });
    const failedCount = failed.length;
    console.log(`\n\nSuccess: ${count - failedCount} \nFailed: ${failedCount}\n`);
    for (const failedName of failed) console.log(failedName);
} catch (e) {
    console.error('error occurred while recognizing', e);
    process.exit();
}