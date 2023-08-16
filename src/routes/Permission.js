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
router.get("/folder/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(503).send();
});
router.patch("/folder/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(503).send();
});

router.get('/:id/fmdata',controller.get_file_metadata);
router.post('/:id/fmdata',controller.post_file_metadata);
router.patch('/:id/fmdata',controller.patch_file_metadata);
router.delete('/:id/fmdata',controller.delete_file_metadata);

module.exports=router;