const express  =  require("express");
const router  = express.Router();

const { generategeneralData } = require("../utils/PageData");

const tokenmdwr = require("../middleware/Token");
const usermdwr  = require("../middleware/User");

const controller = require('../controller/Files');
const service = require("../services/File");
const foldersrv = require("../services/Folder");

router.post("/",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.post_files);
router.get("/all",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,controller.get_all_folder_file);

router.get("/:id",tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData,async(req,res)=>{
    try {
        let {id}=req.params;
        if(id==undefined) throw new Error(`file id not provided..`)
        let resx  = await service.get_by_id(id,req.user_data);
        resx.metadata.size = (((resx.metadata.size)/1024)/1024).toFixed(3);
        let folder = await foldersrv.get_by_id(resx.folder);
        resx.folder = folder;
        console.log(resx);
        res.status(200).render('page-file-view.ejs',{data:{
            ...req.user_data,
            ...generategeneralData(),
            file : {...resx}
            
        }});
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