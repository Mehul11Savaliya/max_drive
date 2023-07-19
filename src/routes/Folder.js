const express  =  require("express");
const router  = express.Router();

const tokenmdwr  = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

const controller  = require('../controller/Folder');

router.get("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.post_folder,controller.get_folder);
router.post("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.post_folder,controller.post_folder);
router.put("/:id",(req,res)=>{
    res.status(503).send();
});
router.patch("/:id",(req,res)=>{
    res.status(503).send();
});
router.delete("/:id",(req,res)=>{
    res.status(503).send();
});

module.exports= router;