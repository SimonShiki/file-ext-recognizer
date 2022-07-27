const fs = require('fs');
const path = require('path');

const _dir = process.argv[2];
if (!_dir) {
    console.log('file path must be given');
    process.exit();
}

try {
    console.log('reading directory...');
    const files = fs.readdirSync(_dir);
    if (!files) throw new Error('no files');
    count = files.length;
    console.log('renaming...');
    files.forEach(fileName => {
        if (fileName.indexOf('.') !== -1) {
            try {
                const newName = fileName.split('.')[0];
                const filePath = path.join(_dir, fileName);
                const newPath = path.join(_dir, newName);
                fs.renameSync(filePath, newPath);
            } catch (e) {
                console.log('failed to eat ', fileName, e.message);
            }
        }
    });
} catch (e) {
    console.error('error occurred while recognizing', e);
    process.exit();
}