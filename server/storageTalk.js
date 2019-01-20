const {Storage} = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({projectId: "snapstack", keyFilename: path.join(__dirname, 'storage-secret.json')});

const bucket = storage.bucket('snapstack-photos');

function generateObjectName() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    const length = 12; // could safely store 2^70 objects without slowing runtime
    let ans = ""
    for(let i = 0; i < length; i++) {
        ans += chars[Math.floor(Math.random() * chars.length)];
    }
    return ans;
}


function uploadImagePromise(image) {
    return new Promise(function(resolve, reject) {
        const name = generateObjectName();
        const file = bucket.file(name, {generation: 0}); // generation:0 means there can't exist a previous file
        file.createWriteStream()
            .on('error', error => {
                if(error.code == 412) {
                    resolve(uploadImagePromise(image));
                } else {
                    reject(error);
                }
            })
            .on('finish', () => {
                resolve(name);
            })
            .end(Buffer.from(image));
    });
}

function downloadImagePromise(name) {
    return bucket.file(name).download().then(data => data[0]); // data[0] is the file data
}


module.exports = {uploadImagePromise, downloadImagePromise};