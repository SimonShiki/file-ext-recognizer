// thanks to https://github.com/pfrazee/identify-filetype

const magic = {
    'ffd8ff': 'jpg',
    '89504e47': 'png',
    '494433': 'mp3',
    '52494646': 'wav'
};

module.exports = magic;