const express  =  require("express");
const router  = express.Router();

router.get("/:id",(req,res)=>{
    res.status(503).send();
});
router.post("/",(req,res)=>{
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