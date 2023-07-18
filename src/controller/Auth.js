const crypto = require("crypto");

const usersrv = require('../services/User');
const tokensrv = require('../services/Token');
const authsrv = require('../services/Auth');

const { encrypt } = require('../utils/CryptoGraph');
const { generateSigninPageData } = require("../utils/PageData");


const auth_sign_in = async (req, res) => {
    try {
        // console.log(req.body);
        let { email, password } = req.body;
        if (password == null || password == '' || email == null || email == undefined) throw new Error(`invalid credential..`)
        let user = await usersrv.varifyUser(email, password);
        let tkdt = JSON.parse(JSON.stringify(user));
        delete tkdt['password']
        delete tkdt['phone']
        delete tkdt['updatedAt']
        delete tkdt['createdAt']
        let tokensx = tokensrv.createTokens(tkdt);
        let tokens = JSON.stringify(tokensx);
        res.cookie('jwt', tokens);
        res.redirect('/user/');
    } catch (error) {
        res.status(400).render('auth-sign-in.ejs', {
            data: { errmsg: error.message, ...generateSigninPageData() }
        });
    }
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
            data.password = encrypt(data.password);
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
                next: '/user/'
            });
        } catch (error) {
            //  console.log(error);
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



module.exports = {
    auth_sign_in,
    auth_sign_up
}