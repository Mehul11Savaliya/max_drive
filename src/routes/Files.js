const express  =  require("express");
const router  = express.Router();

const tokenmdwr = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

const controller = require('../controller/Files');


router.post("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.post_files);
router.get("/all",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_all_folder_file);

router.get("/:id",(req,res)=>{
    res.status(503).send();
});

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