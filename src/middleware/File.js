const  filesrv  = require("../services/File");
const cryptosrv  = require("../utils/CryptoGraph");
const usersrv  = require("../services/User");
const tokensrv = require("../services/Token");

const shareemmiter = require("../subscriber/ShareEvents");

const extract_file=async(req,res,next)=>{
    try {
        let {id} = req.params;
        let resx = await filesrv.read(id);
        req.file_info = resx;
        next(); 
    } catch (error) {
        res.status(404).send();
    }
}

const check_file_pass=(req,res,next)=>{
    try {
        let {user,file_info} = req;
        if (user!=undefined&&file_info.createdBy==user.email) {
            return  next();
        }
        if (req.file_info.password==null) {
         return   next();
        }
        let {password} = req.query;
        if (password==undefined) {
            throw new Error(`credential not provided..`);
        }
        if (req.file_info.password===cryptosrv.encrypt(password.trim().toString())) {
        return    next()
        }else{
          let  filpth = file_info.metadata.path.split("/");
            shareemmiter.emit("share",{
                fileid: file_info.id,
                filename: file_info.metadata.name,
                servername: filpth[filpth.length-1],
                user: (user==undefined||user == null) ? "anonymous" : user.email,
                time: Date.now(),
                message:"invalid credintial"
              })
            throw new Error(`auth failed..`);
        }
    } catch (error) {
        console.log(error);
      return  res.status(401).json({
            errmsg  : error.message
        });
    }
}

const get_user=async(req,res,next)=>{
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

         let user = await usersrv.getUserByEmail(tokendata.email);
         req.user = user;
         next();
    } catch (error) {
        res.user = null;
        next();
    }
}

module.exports={extract_file,check_file_pass,get_user};