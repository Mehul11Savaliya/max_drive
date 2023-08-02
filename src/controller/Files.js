const service = require("../services/File")
const filehandler = require("../services/FileHandler");
const uuid  = require("uuid");

const post_files = async (req, res) => {
    try {
        if (req.files == null)
            throw new Error(`file not provided..`);

        let arr = new Array();
        console.log(req.files.file);
        let files = req.files.file;
        if (files.length === undefined) {
            let ext;
            let metadata = {};
            metadata.name = files.name.replaceAll(' ','-');
            ext = metadata.name.split('.');
            ext = ext[ext.length-1];
            metadata.size = files.size;
            metadata.encoding = files.encoding;
            metadata.mimetype = files.mimetype;
            metadata.checksum = files.md5;
            
            try {
                let name = uuid.v4()+"."+ext;//Date.now() + metadata.name;
                let pathx = filehandler.move_file_to(files.data, `../uploads/${name}`);
                metadata ={...metadata,path:pathx};
                console.log("path is : ",pathx);
                let file = {
                    folder: req.body.folder,
                    metadata: metadata,
                    createdBy: req.user_data.email,
                    updatedBy: req.user_data.email,
    
                }
                let resp = await service.create(file);
                arr.push(resp);
            } catch (error) {
                console.log(error);
                throw new Error(`not able to save file`)
            }
        } else {
            for (let index = 0; index < files.length; index++) {
                const filex = files[index];
                let metadata = {};
                let ext;
                metadata.name = filex.name.replaceAll(' ','-');
                ext = metadata.name.split('.');
                ext = ext[ext.length-1];
                metadata.size = filex.size;
                metadata.encoding = filex.encoding;
                metadata.mimetype = filex.mimetype;
                metadata.checksum = filex.md5;
                try {
                    let name = uuid.v4()+"."+ext;//Date.now() + metadata.name;
                    let pathx = filehandler.move_file_to(filex.data, `../uploads/${name}`);
                    console.log("path is : ",pathx);
                    // metadata['path'] = pathx;
                    metadata ={...metadata,path:pathx};
                    
                    let file = {
                        folder: req.body.folder,
                        metadata: metadata,
                        createdBy: req.user_data.email,
                        updatedBy: req.user_data.email,
                    }

                    let resp = await service.create(file);
                    arr.push(resp);
                } catch (error) {
                    console.log(error);
                }

            }
        }
        console.log(arr);
        res.status(201).json(arr);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const get_all_folder_file = async (req, res) => {
    let { folder } = req.query;
    try {
        if (folder === undefined) throw new Error(`folder id not provided..`);
        let files = await service.get_files_from_folder(Number.parseInt(folder));
        res.status(200).json(files);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const delete_file=async(req,res)=>{
    try {
        let {id} = req.params;
            if(id==undefined)  throw new Error(`id not provided..`);
        let resx  = await service.delete_file(id,req.user_data);
        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
}

module.exports = {
    post_files,
    get_all_folder_file,
    delete_file
}