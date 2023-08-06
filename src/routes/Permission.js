const express  = require("express");
const router = express.Router();

const tokenmdwr = require("../middleware/Token");
const usermdwr = require("../middleware/User");

router.get("/file",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(503).send();
});
router.patch("/file",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(503).send();
});
router.get("/folder",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(503).send();
});
router.patch("/folder",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,(req,res)=>{
    res.status(503).send();
});

module.exports=router;