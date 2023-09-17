const express = require("express");
const router  = express.Router();

const controller  = require("../controller/Analytics");

const tokenmdwr = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

router.use((req,res,next)=>{
    console.log(`analytics route access at ${Date.now()} ip=${req.ip}`);
    next();
})

router.get("/files",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_file_list);
router.get("/docs",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_index_docs_list);
router.get("/storage",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_storage_usage)

module.exports=router;