const express  =  require("express");
const router  = express.Router();

const tokenmdwr  = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

const controller  = require('../controller/Folder');

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

module.exports= router;