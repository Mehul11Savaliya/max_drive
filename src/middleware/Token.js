const service = require('../services/Token');

const extractTokenFromCookie = (req,res,next) => { 
    try {
        let jwt = JSON.parse(req.cookies.jwt);
        if(jwt===undefined||jwt===null)
            throw new Error(`try to login again..`)
        req.access_token = jwt.access;
        req.refresh_token = jwt.refresh;
        next(); 
    } catch (error) {
        res.status(400).render('pages-error.ejs',{
            data :{
                errmsg : error.message
            }
        });        
    }
}

const checkAccessToken=(req,res,next)=>{
    try {
        let data=service.checkAccessToken(req.access_token);
        req.data  = data;
        next();
    } catch (error) {
        console.log(error);
        res.render('pages-error.ejs',{
            data :{
                errmsg : error.message
            }
        });
        // throw new Error(`token expired..`)
    }
}

module.exports={
    extractTokenFromCookie,
    checkAccessToken
}