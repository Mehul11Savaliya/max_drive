const express = require("express");
const router = express.Router();

const usermdwr = require("../middleware/User");
const tokenmdwr = require("../middleware/Token");

const controller = require("../controller/Admin");
const storagectr = require("../controller/Storage");

router.use(tokenmdwr.extractTokenFromCookie);
router.use(tokenmdwr.checkAccessToken);
router.use(usermdwr.getUserFromTokeData);

router.use((req,res,next)=>{
    console.log(`admin router used at ${Date.now()} ip : ${req.ip}`)
    next();
})

router.get("/userlist",usermdwr.check_admin,controller.user_list);
router.get("/analytics",usermdwr.check_admin,controller.analytics_page);
router.get("/storage",usermdwr.check_admin,storagectr.get_storage);
router.get("/bugs",usermdwr.check_admin,controller.bugs_list);

module.exports=router;