const express  = require("express");
const router  = express.Router();

router.get('/file/:id',(req,res)=>{
    res.status(503).send();
});
router.get('/folder/:id',(req,res)=>{
    res.status(503).send();
});

module.exports=router;