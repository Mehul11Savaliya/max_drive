const express = require("express");
const router = express.Router();

const tokenmdwr = require("../middleware/Token");
const usermdwr = require("../middleware/User");
const controller = require("../controller/Rooms");

router.use((req,res,next)=>{
    console.log(`rooms route used st ${Date.now()} ip : ${req.ip}`);
    next();
})

router.get("/:id/view",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_room_view);
router.get("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_page);
router.get("/find",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_room);
router.post("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.create_room);
router.delete("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.delete_room);

module.exports=router;