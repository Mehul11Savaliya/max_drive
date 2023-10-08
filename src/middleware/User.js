let service = require('../services/User');
const tokensrv = require("../services/Token");

const getUserFromTokeData =async(req,res,next)=>{
    try {
        let tokendata  = req.data;
        let user  = await service.getUserByEmail(tokendata.email);
        req.user_data  = user;
        next();
    } catch (error) {
        console.log(error);
        res.render('pages-error.ejs',{
            data :{
                errmsg : error.message
            }
        });
    }
}

const get_user_from_cookie=async(req,res,next)=>{
    try {
        //extracting token from cookie
        let jwt = JSON.parse(req.cookies.jwt);
        if (jwt === undefined || jwt === null)
            throw new Error(`try to login again..`)
        let access_token = jwt.access;
        let refresh_token = jwt.refresh;

        //checking the token..
        let data = tokensrv.checkAccessToken(access_token);
        let tokendata = data;
        let user = await service.getUserByEmail(tokendata.email);
        delete user['password'];
        req.user_data = user;
        next();
   } catch (error) {
       res.user = null;
       next();
   }
}

module.exports={
    getUserFromTokeData,
    get_user_from_cookie
}