const filesrv = require("../services/File");
const tokensrv = require('../services/Token');
const usersrv = require("../services/User");
const { generategeneralData } = require("../utils/PageData");

const couchsrv = require("../services/couchdb");

var emmiterx = require("../subscriber/ShareEvents");
var filevents = require("../subscriber/FileEvents");

const get_file = async (req, res) => {
    let user = req.user_data;
    let file = req.file_info;
    // console.log("finfo",file);
    filevents.emit("download",{id:file.id,downloads:Number.parseInt(file.downloads)+1});
    res.status(200).render('page-share-view.ejs',{
        data:{
            ...generategeneralData(),
            file:file,
            user:{email:(user == null) ? undefined : user.email}
        }
    });
}

const get_live_share_page=(req,res)=>{
    res.status(200).render("page-live-share.ejs",{
        data:{
            ...generategeneralData(),
            ...req.user_data,
            ...generategeneralData()
        }
    })
}

const get_folder=(req,res)=>{
    res.status(200).render('page-folder-share.ejs',{
        data:{
            ...generategeneralData(),
            folder:req.folder_info,
            user:req.user_data
        }
    });
}

module.exports = { get_file,get_live_share_page,get_folder ,emmiterx:emmiterx}