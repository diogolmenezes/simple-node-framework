const Loggable = require('./base/loggable');
const crypto = require('crypto');

// this class abstract the security concept
class Security extends Loggable {
    constructor() {
        super({
            module: 'SNF Security'
        });

        this.crypto = crypto;
        this.algorithm = 'aes-256-ctr';
        this.secretKey = process.env.SNF_CRYPTO_KEY;
        this.iv = crypto.randomBytes(16);        
    }

    async encrypt(text) {
        if(!this.secretKey)
            throw new Error('To use SNF security encryption you must define your key in SNF_CRYPTO_KEY environment variable')

        const cipher = this.crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return {
            iv: this.iv.toString('hex'),
            content: encrypted.toString('hex')
        };
    };

    async decrypt(hash) {
        if(!this.secretKey)
            throw new Error('To use SNF security encryption you must define your key in SNF_CRYPTO_KEY environment variable')
            
        const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, Buffer.from(hash.iv, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
        return decrpyted.toString();
    };
}

module.exports =  Security;
