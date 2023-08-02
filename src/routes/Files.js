const express  =  require("express");
const router  = express.Router();

const tokenmdwr = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

const controller = require('../controller/Files');
const service = require("../services/File");


router.post("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.post_files);
router.get("/all",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_all_folder_file);

router.get("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,async(req,res)=>{
    try {
        let {id}=req.params;
        if(id==undefined) throw new Error(`file id not provided..`)
        let resx  = await service.get_by_id(id,req.user_data);
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.put("/:id",(req,res)=>{
    res.status(503).send();
});
router.patch("/:id",(req,res)=>{
    res.status(503).send();
});
router.delete("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.delete_file);


module.exports= router;