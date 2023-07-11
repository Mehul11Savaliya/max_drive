const usersrv = require('../services/User');
const tokensrv = require('../services/Token');
const authsrv  = require('../services/Auth');

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
            ress = await usersrv.create(data);
            let tkdt = JSON.parse(JSON.stringify(ress));
            delete tkdt['password']
            delete tkdt['phone']
            delete tkdt['updatedAt']
            delete tkdt['createdAt']
            let tokensx = tokensrv.createTokens(tkdt);
           let  tokens = JSON.stringify(tokensx);
            console.log(tokens);
            await authsrv.create({
                email : ress.email,
                refresh_toke : tokensx.refresh
            });
            res.cookie('jwt', tokens)
        } catch (error) {
            throw new Error(`not able to create a user ${error.message}`)
        }
        res.status(201).json(ress);

    } catch (error) {
        res.status(400).json(error.message);
    }
}

module.exports = {
    auth_sign_in,
    auth_sign_up
}