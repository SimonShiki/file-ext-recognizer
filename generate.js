const fs = require('fs');
const path = require('path');

const _dir = process.argv[2];
if (!_dir) {
    console.log('file path must be given');
    process.exit();
}

const mapping = {};

try {
    console.log('reading directory...');
    const files = fs.readdirSync(_dir);
    if (!files) throw new Error('no files');
    files.forEach(fileName => {
        try {
            const folderPath = path.join(_dir, fileName);
            if(fs.statSync(folderPath).isDirectory()) {
                const metadatas = fs.readdirSync(folderPath);
                if (metadatas.includes('public.json')) {
                    generateMapping(path.join(folderPath, 'public.json'));
                }
                if (metadatas.includes('private.json')) {
                    generateMapping(path.join(folderPath, 'private.json'));
                }
            }
        } catch (e) {
            console.error('failed to generate ' + fileName, e.message);
        }
    });
    console.log('saving mapping...');
    const content = JSON.stringify(mapping);
    fs.writeFileSync(path.join(__dirname, 'mapping.json'), content);
} catch (e) {
    console.error('fatal error occurred while mapping', e);
    process.exit();
}

function generateMapping (jsonPath) {
    const raw = fs.readFileSync(jsonPath).toString();
    const { targets } = JSON.parse(raw);
    if (!targets) throw new Error('no target found in ' + jsonPath);
    for (const target of targets) {
        const { costumes } = target;
        for (const costume of costumes) {
            if (costume.md5ext && costume.assetId) {
                mapping[costume.assetId] = costume.md5ext;
            }
        }
    }
}