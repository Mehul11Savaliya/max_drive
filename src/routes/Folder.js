const express  =  require("express");
const router  = express.Router();

const tokenmdwr  = require("../middleware/Token");
const usermdwr  = require("../middleware/User");
const foldermdwr = require("../middleware/Folder");
const filemdwr = require("../middleware/File");

const controller  = require('../controller/Folder');
const filectrl = require("../controller/Files");

router.use((req,res,next)=>{
    console.log("folder route accessed : ",Date.now());
    next();
})

router.get("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_all_folder);
router.get("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_folder);
router.post("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.post_folder);
router.put("/:id",(req,res)=>{
    res.status(503).send();
});
router.patch("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.patch_folder);
router.delete("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.delete_folder);
router.delete("/folders/ids",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.delete_multiple_folder);

router.get("/:id/content",usermdwr.get_user_from_cookie,foldermdwr.extract_folder,foldermdwr.check_password,controller.get_list_file);
router.get("/:id/file/:fid/content",usermdwr.get_user_from_cookie,foldermdwr.extract_folder,foldermdwr.check_password,filemdwr.extract_file,controller.get_file_content);
module.exports= router;