const express = require('express');
const router  = express.Router();

const controller  = require('../controller/User');
const profilecontroller = require("../controller/Profilecontroller");

const tokenmdwr  = require('../middleware/Token');
const usermdwr  = require('../middleware/User');

router.use((req,res,next)=>{
    try {
        console.log("| INFO |"," body ",req.body);
        console.log("| INFO |","user route accessed time:",Date.now());
        next();
    } catch (error) {
        console.log("| ERROR |","user route access error",error);
    }
})


router.get('/',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_user_home);
router.get('/:page',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_pages)
router.get('/folder/:id',tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_folder_pages)

router.patch("/profile",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,profilecontroller.patch_profile);

module.exports=router;
