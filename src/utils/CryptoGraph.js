const crypto = require("crypto");
const pass_secret = process.env.PASS_SECRET;

function encrypt(data, key=pass_secret) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encrypteddata, key=pass_secret) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypteddata, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports={
    encrypt,decrypt
}