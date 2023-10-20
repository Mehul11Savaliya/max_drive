const crypto = require("crypto");

const usersrv = require('../services/User');
const tokensrv = require('../services/Token');
const authsrv = require('../services/Auth');
const commssrv = require("../services/Communication");

const { encrypt } = require('../utils/CryptoGraph');
const { generateSigninPageData ,generategeneralData} = require("../utils/PageData");
const {genOtp} = require("../utils/OTP");

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
            let otp = genOtp(6);
            let to = ress.email;
          let auth =  await authsrv.create({
                email: ress.email,
                refresh_toke: tokensx.refresh,
                attempts:{
                    varify:3
                },
                otp:otp,
                varified:false
            });
            await commssrv.send_otp_varify_msg(to,otp);
            res.cookie('jwt', tokens);
            res.status(201).json({
                next: `/auth/${auth.id}/screen/varifyotp`
            });
        } catch (error) {
             console.log(error);
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

const get_otp_sceen=async(req,res)=>{
   try {
    let {id}=req.params;
    if (id==undefined) {
        throw new Error(`☠`)
    }
    id = Number.parseInt(id);
    let auth = await authsrv.get_by_id(id,true);
    if (auth.varified) {
        return res.redirect("/user");
    }
    if (auth.attempts.varify<=0) {
      return  res.status(400).send("🐦your account deleted successfully..☠😂");
    }
    res.status(200).render("auth-lock-screen.ejs",{
        data:{
            ...generategeneralData(),
            auth:{...auth}
        }
    });
   } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
   }
}

const auth_varify_otp=async(req,res)=>{
    try {
        let {otp,id} = req.body;
        if (id==undefined||otp==undefined) {
            throw new Error("☠🐦")
        }
        id = Number.parseInt(id);
        let auth = await authsrv.get_by_id(id,true);
        if (auth.varified) {
            return res.redirect("/user");
        }
        if (auth.otp!=otp) {
            auth.attempts.varify = auth.attempts.varify -1;
            if (auth.attempts.varify<=0) {
                await usersrv.delete_by_email(auth.email);
                throw new Error(`your account deleted successfully!😂☠🐦`);
            }
            console.log(auth);
            await authsrv.update(id,auth);
            throw new Error(`invalid otp`);
        }
        else{
            auth.varified = true;
            await authsrv.update(id,auth);
            res.status(200).json({
                next:"/user/"
            })
        }
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        })
    }
}

const send_otp=async(req,res)=>{
    try {
        let {id}=req.params;
        if (id==undefined) {
            throw new Error(`☠`)
        }
        id = Number.parseInt(id);
        let auth = await authsrv.get_by_id(id,true);
        if (auth.varified) {
            return res.redirect("/user");
        }
        if (auth.attempts.varify<=0) {
          return  res.status(400).send("🐦your account deleted successfully..☠😂");
        }
        await commssrv.send_otp_varify_msg(auth.email,auth.otp);
      return  res.status(200).send("otp sended..🕳");
    }catch(err){
        res.status(400).send(err.message);
    }
}

module.exports = {
    auth_sign_in,
    auth_sign_up,
    get_otp_sceen,
    auth_varify_otp,
    send_otp
}