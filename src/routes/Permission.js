const express  = require("express");
const router = express.Router();

const tokenmdwr = require("../middleware/Token");
const usermdwr = require("../middleware/User");

const controller  = require("../controller/Permission");

router.use((req,res,next)=>{
    console.log("Permission route accessed at : ",Date.now());
    next();
})

router.get("/file/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(503).send();
});
router.patch("/file/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(503).send();
});

router.get("/folder/:id/shardata",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_folder_sharedata);
router.patch("/folder/:id/shardata",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.patch_folder_sharedata);

router.patch("/file/:id/shardata",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.patch_file_sharedata);
router.get("/file/:id/shardata",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_file_sharedata);

router.get('/:id/fmdata',controller.get_file_metadata);
router.post('/:id/fmdata',controller.post_file_metadata);
router.patch('/:id/fmdata',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.patch_file_metadata);
router.delete('/:id/fmdata',controller.delete_file_metadata);

module.exports=router;