const express  = require("express");
const router  = express.Router();

const filemdwr  = require("../middleware/File");
const tokenmdwr  = require("../middleware/Token");
const usermdwr  = require("../middleware/User");
const foldermdwr = require("../middleware/Folder");

const controller  = require("../controller/Share");
router.use((req,res,next)=>{
console.log(`(${req.ip}) share route accessed at : `,Date.now());
next();
});

router.get('/file/:id',usermdwr.get_user_from_cookie,filemdwr.extract_file,filemdwr.is_accessible,controller.get_file);

router.get('/folder/:id',usermdwr.get_user_from_cookie,foldermdwr.extract_folder,foldermdwr.is_accessible,controller.get_folder);

router.get('/live',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_live_share_page);

module.exports=router;