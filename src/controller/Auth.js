const crypto = require("crypto");

const usersrv = require('../services/User');
const tokensrv = require('../services/Token');
const authsrv = require('../services/Auth');


const pass_secret = process.env.PASS_SECRET;

const auth_sign_in = (req, res) => {

}

const auth_sign_up = async (req, res) => {
    try {
        let data = req.body;

        // let regex  = /^[a-zA-Z@+\-]{100}/g;
        // let regex= new RegExp('/^[a-zA-Z@+\-]{5,100}/g')
        // for(let key in data) {
        //   if(!regex.test(data[key])) throw new Error(`invalid request`);
        // }
        let ress;

        try {
            data.password = encrypt(data.password, pass_secret);
            ress = await usersrv.create(data);
            let tkdt = JSON.parse(JSON.stringify(ress));
            delete tkdt['password']
            delete tkdt['phone']
            delete tkdt['updatedAt']
            delete tkdt['createdAt']
            let tokensx = tokensrv.createTokens(tkdt);
            let tokens = JSON.stringify(tokensx);
            // console.log(tokens);
            await authsrv.create({
                email: ress.email,
                refresh_toke: tokensx.refresh
            });
            res.cookie('jwt', tokens);
            res.status(201).json({
                next :'/user/'
            });
        } catch (error) {
            // console.log(error);
            // throw new Error(`not able to create a user ${error.message}`);
            res.status(400).json({
                data: {
                    errmsg: "User Already Exist."
                }
            });
        }
    } catch (error) {
        res.status(400).json(error.message);
    }
}

function encrypt(data, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encrypteddata, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypteddata, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    auth_sign_in,
    auth_sign_up
}