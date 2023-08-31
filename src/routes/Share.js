const express  = require("express");
const router  = express.Router();

const filemdwr  = require("../middleware/File");
const tokenmdwr  = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

const controller  = require("../controller/Share");

router.use((req,res,next)=>{
console.log(`(${req.ip}) share route accessed at : `,Date.now());
next();
});

router.get('/file/:id',filemdwr.extract_file,controller.get_file);

router.get('/folder/:id',(req,res)=>{
    res.status(503).send();
});

module.exports=router;