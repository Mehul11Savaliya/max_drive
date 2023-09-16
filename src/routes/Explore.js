const express  = require("express");
const router  = express.Router();

const controller  = require("../controller/Explore");

const tokenmdwr  = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

router.get("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_page);
router.get("/data",controller.get_public_files);
// tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData
module.exports=router;