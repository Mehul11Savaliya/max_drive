const express = require("express");
const router = express.Router();

const controller = require("../controller/Bugs");

const tokenmdwr  = require('../middleware/Token');
const usermdwr  = require('../middleware/User');
const { generategeneralData } = require("../utils/PageData");

router.use((req,res,next)=>{
    console.log(`bugs route used at ${Date.now()} ip=${req.ip}`);
    next();
})

router.get("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(200).render("page-bugreport.ejs",{
        data: {
            ...generategeneralData(),
            ...req.user_data
        }
    })
});

router.post("/",usermdwr.get_user_from_cookie,controller.post_bug);
router.get("/all",usermdwr.get_user_from_cookie,controller.get_bugs);

module.exports=router;