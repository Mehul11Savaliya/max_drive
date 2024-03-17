const router = require("express").Router();

const foldersrv = require("../services/Folder");
const filesrv = require("../services/File");
const uuid = require("uuid");
const filehandler = require("../services/FileHandler");
const permissionsrv = require("../services/Permission");

router.use((req,res,next)=>{
    console.log(`test route accessed at ${Date.now()}`);
    next();
})

router.post("/folder/bulk",async(req,res)=>{
    console.log("meow : ",req.files.folder);
    console.log(req.body);
    try {
        let {folder} = req.files;
        let {folder_name}=req.body;
        if (folder==undefined||folder.length==0) {
            throw new Error(`no files uploaded..`);
        }
        if (folder_name==undefined||folder_name=="") {
            throw new Error(`folder name not provided..`);
        }
     let folderx =  await foldersrv.create({name:folder_name,createdBy:"svlmehul@gmail.com",updatedBy:"svlmehul@gmail.com"});
     let defpermi = await permissionsrv.create({createdBy:"svlmehul@gmail.com",folder:folderx.id});
     let files = [];
        for (let index = 0; index < folder.length; index++) {
            const file = folder[index];
            let metadata = {};
                let ext;
                metadata.name = file.name.replaceAll(' ', '-');
                ext = metadata.name.split('.').pop();
                metadata.size = file.size;
                metadata.encoding = file.encoding;
                metadata.mimetype = file.mimetype;
                metadata.checksum = file.md5;
                try {
                    let name = uuid.v4() + "." + ext;
                    let pathx = filehandler.move_file_to(file.data, `../uploads/${name}`);
                    console.log("path is : ", pathx);
                    metadata = { ...metadata, path: pathx };
                    let filex = {
                        folder: folderx.id,
                        metadata: metadata,
                        createdBy: "svlmehul@gmail.com",
                        updatedBy: "svlmehul@gmail.com",
                        tags: [metadata.name]
                    }

                    let resp = await filesrv.create(filex);
                    await permissionsrv.create({createdBy:resp.createdBy,file:resp.id});
                    files.push(resp.dataValues);
                }catch(er){
                    console.log(er);
                    files.push({errmsg:er.message});
                }
        }
        folderx.files = files;
        res.status(201).json(folderx);
    } catch (error) {
        res.status(400).json({
            errmsg:error.message
        });
    }
})

module.exports=router;