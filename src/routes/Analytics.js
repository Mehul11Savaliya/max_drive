const express = require("express");
const router  = express.Router();

const controller  = require("../controller/Analytics");

const tokenmdwr = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

const auditsrv = require("../services/Audit");

router.use((req,res,next)=>{
    console.log(`analytics route access at ${Date.now()} ip=${req.ip}`);
    next();
})

router.get("/files",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_file_list);
router.get("/files/search",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_file_search)
router.get("/docs",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_index_docs_list);
router.get("/storage",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_storage_usage);
router.get('/storage/usage',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_storage_usage_stats);
router.get("/upanddowns",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_upsanddown)

//audit
// tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,
router.get("/file/:id/audit",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_file_audit);
router.get("/folder/:id/audit",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_folder_audit);
router.get("/audit",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,usermdwr.check_admin,async(req,res)=>{
    try {
        let audit = await auditsrv.get_page_by_user();
        res.status(200).json(audit);
    } catch (error) {
        res.status(500).json({
            errmsg:error.message
        })
    }
})
module.exports=router;