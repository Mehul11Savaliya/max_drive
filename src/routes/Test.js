const router = require("express").Router();

router.use((req,res,next)=>{
    console.log(`test route accessed at ${Date.now()}`);
    next();
})

router.post("/",(req,res)=>{
    
})

module.exports=router;