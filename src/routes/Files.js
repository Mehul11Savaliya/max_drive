const express  =  require("express");
const router  = express.Router();


const tokenmdwr = require("../middleware/Token");
const usermdwr  = require("../middleware/User");
const filemdwr  = require("../middleware/File")

const controller = require('../controller/Files');

router.use((req,res,next)=>{
   console.log(`file route used at :${Date.now()} ip:${req.ip}`); 
    next();
})

router.post("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.post_files);
router.get("/all",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_all_folder_file);

router.get("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_file);

router.put("/:id",(req,res)=>{
    res.status(503).send();
});
router.patch("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.patch_file);
router.delete("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.delete_file);

router.get("/:id/content",filemdwr.extract_file,filemdwr.get_user,filemdwr.check_file_pass,controller.get_file_content);

router.get("/:id/crypto",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_crypto_file)
router.post("/crypto",controller.post_decrypt_file);

module.exports= router;