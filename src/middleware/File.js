const  filesrv  = require("../services/File");
const cryptosrv  = require("../utils/CryptoGraph");
const usersrv  = require("../services/User");
const tokensrv = require("../services/Token");

const shareemmiter = require("../subscriber/ShareEvents");
var filevents = require("../subscriber/FileEvents");

const extract_file=async(req,res,next)=>{
    try {
        let {id} = req.params;
        let {fid} = req.params; //if access through folder
        let resx = await filesrv.get_all_details(fid||id,true);
        req.file_info = resx;
        next(); 
    } catch (error) {
        console.log(error);
        res.status(404).send();
    }
}

const check_file_pass=(req,res,next)=>{
    try {
        let {user_data,file_info} = req;
        // console.log("test",file_info.createdBy==user_data.email);
        if (user_data!=undefined&&file_info.createdBy==user_data.email) {
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
                user: (user_data==undefined||user_data == null) ? "anonymous" : user_data.email,
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

const is_accessible=(req,res,next)=>{
    try {
        let file = req.file_info;
        let user = req.user_data;
        let {share_settings}=file.permission;
        if (share_settings==undefined) {
         return  res.status(500).send();
        }
        if (share_settings.is_public) {
            //emmiting twice for owner
            if (user!=null&&file.createdBy==user.email) {
                return  next();
                 }
            shareemmiter.emit("share",{
                fileid : file.id,
                filename:file.metadata.name,
                user:`user : ${user==null?'public':user.email}`,
                author:file.createdBy,
                time:Date.now()
            });
            // filevents.emit("download",{id:file.id,downloads:Number.parseInt(file.downloads)+1});
          return  next();
        }else{
            if (user!=null&&file.createdBy==user.email) {
           return  next();
            }
            let allowed_user = share_settings.share_with;
            if (user!=null&&allowed_user!=null) {
                if (allowed_user.includes(user.email)) {
                    // filevents.emit("download",{id:file.id,downloads:Number.parseInt(file.downloads)+1});
              return   next();
                }
                else{
                    shareemmiter.emit("share",{
                        fileid : file.id,
                        name:file.metadata.name,
                        user:`unauthorized user : ${user.email}`,
                        author:file.createdBy,
                        time:Date.now()
                    });
                    return res.status(401).send();
                }
            }else{
                shareemmiter.emit("share",{
                    fileid : file.id,
                    name:file.metadata.name,
                    user:`unauthorized user : ${user==null?'':user.email}`,
                    author:file.createdBy,
                    time:Date.now()
                });
                return res.status(401).send();
            }
            return  res.status(500).send();
        }
    } catch (error) {
        res.status(400).json({
            errmsg:error.message
        });
    }
    }

module.exports={extract_file,check_file_pass,get_user,is_accessible};