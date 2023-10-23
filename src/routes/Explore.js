const express  = require("express");
const router  = express.Router();

const controller  = require("../controller/Explore");

const tokenmdwr  = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

router.get("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_page);
router.get("/data",controller.get_public_files);
router.post("/file/:id/comments",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.post_comments);
router.get("/file/:id/comments",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_comments);
// tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData
module.exports=router;