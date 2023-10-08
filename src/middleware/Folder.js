const foldersrv  = require("../services/Folder");
const cryptosrv  = require("../utils/CryptoGraph");
const usersrv  = require("../services/User");
const tokensrv = require("../services/Token");

const extract_folder=async(req,res,next)=>{
    try {
        let {id} = req.params;
        let resx = await foldersrv.get_all_details(id,true);
        req.folder_info = resx;
        // res.status(200).json({
        //     folder:resx,
        //     user : {...req.user_data}
        // });
        next(); 
    } catch (error) {
        res.status(404).send();
    }
}

const check_password=async(req,res,next)=>{
    try {
        let {user_data,folder_info} = req;
        if (user_data!=undefined&&Object.keys.length!=0&&folder_info.createdBy==user_data.email) {
            return  next();
        }
        if (folder_info.password==null) {
         return   next();
        }
        let {password} = req.query;
        if (password==undefined) {
            throw new Error(`credential not provided..`);
        }
        if (req.folder_info.password===cryptosrv.encrypt(password.trim().toString())) {
        return    next()
        }else{
        //   let  filpth = folder_info.metadata.path.split("/");
        //     shareemmiter.emit("share",{
        //         fileid: folder_info.id,
        //         filename: folder_info.metadata.name,
        //         servername: filpth[filpth.length-1],
        //         user: (user==undefined||user == null) ? "anonymous" : user.email,
        //         time: Date.now(),
        //         message:"invalid credintial"
        //       })
            throw new Error(`auth failed..`);
        }
    } catch (error) {
        console.log(error);
      return  res.status(401).json({
            errmsg  : error.message
        });
    }
}

//for check the access
const is_accessible=(req,res,next)=>{
try {
    let folder = req.folder_info;
    let user = req.user_data;
    let {share_settings}=folder.permission;
    if (share_settings==undefined) {
     return  res.status(500).send();
    }
    if (share_settings.is_public) {
        next();
    }else{
        if (user!=null&&folder.createdBy==user.email) {
            next();
        }
        let allowed_user = share_settings.share_with;
        if (user!=null&&allowed_user!=null) {
            if (allowed_user.includes(user.email)) {
                next();
            }
            else{
                return res.status(401).send();
            }
        }else{
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

module.exports={extract_folder,check_password,is_accessible};