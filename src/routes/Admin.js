const express = require("express");
const router = express.Router();

const usermdwr = require("../middleware/User");
const tokenmdwr = require("../middleware/Token");

const controller = require("../controller/Admin");

router.use(tokenmdwr.extractTokenFromCookie);
router.use(tokenmdwr.checkAccessToken);
router.use(usermdwr.getUserFromTokeData);

router.use((req,res,next)=>{
    console.log(`admin router used at ${Date.now()} ip : ${req.ip}`)
    next();
})

router.get("/userlist",usermdwr.check_admin,controller.user_list);

module.exports=router;