const service  = require("../services/File")

const post_files=async(req,res)=>{
    try {
        if(req.files==null)
        throw new Error(`file not provided..`);
        
        let arr =new Array();
        console.log(req.files.file);
        let files  = req.files.file;
        if (files.length===undefined) {
            let metadata={};
            metadata.name = files.name;
            metadata.size  = files.size;
            metadata.encoding = files.encoding;
            metadata.mimetype  = files.mimetype;
            metadata.checksum = files.md5;
            let file ={
                folder  : req.body.folder,
                metadata : metadata,
                createdBy:req.user_data.email,
                updatedBy:req.user_data.email,

            }
            try {
             let resp = await service.create(file);   
             arr.push(resp);
            } catch (error) {
             throw new Error(`not able to save file`)   
            }
        } else {
                for (let index = 0; index < files.length; index++) {
                    const filex = files[index]; 
                let metadata={};
                metadata.name = filex.name;
                metadata.size  = filex.size;
                metadata.encoding = filex.encoding;
                metadata.mimetype  = filex.mimetype;
                metadata.checksum = filex.md5;
                let file ={
                    folder  : req.body.folder,
                    metadata : metadata,
                    createdBy:req.user_data.email,
                    updatedBy:req.user_data.email,
                }
                try {
                    let resp = await service.create(file);   
                    arr.push(resp);
                   } catch (error) {
                     console.log(error);
                   }
                  
            }
        }
        console.log(arr);
        res.status(200).json(arr);
    } catch (error) {
        console.log(error);
    res.status(400).json({
        errmsg : error.message
    });   
    }
}

const get_all_folder_file=async(req,res)=>{
        let {folder} =req.query;
        try {
            if(folder===undefined) throw new Error(`folder id not provided..`);
            let files  = await service.get_files_from_folder(Number.parseInt(folder));
            res.status(200).json(files);
        } catch (error) {
            res.status(400).json({
                errmsg : error.message
            });
        }
}

module.exports={
    post_files,
    get_all_folder_file
}