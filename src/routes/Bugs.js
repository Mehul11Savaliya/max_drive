const express = require("express");
const router = express.Router();

const controller = require("../controller/Bugs");

const tokenmdwr  = require('../middleware/Token');
const usermdwr  = require('../middleware/User');
const { generategeneralData } = require("../utils/PageData");
const notificationsrv = require("../services/notification");

router.use((req,res,next)=>{
    console.log(`bugs route used at ${Date.now()} ip=${req.ip}`);
    next();
})

router.get("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,async(req,res)=>{
    let notification = await notificationsrv.get_notification(req.user_data);
  
    res.status(200).render("page-bugreport.ejs",{
        data: {
            ...generategeneralData(),
            ...req.user_data,
            notification : notification
        }
    })
});

router.post("/",usermdwr.get_user_from_cookie,controller.post_bug);
router.get("/all",usermdwr.get_user_from_cookie,controller.get_bugs);

module.exports=router;