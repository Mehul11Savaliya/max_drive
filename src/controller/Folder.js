const service = require("../services/Folder");
const permissionsrv = require("../services/Permission");
const filesrv = require("../services/File");
const path = require("path");
const uuid = require("uuid");
const filehandler = require("../services/FileHandler");
const fs  = require("fs");
const post_folder = async (req, res) => {
    try {
        let user  = req.user_data;
        let data = {};
        let { name, tags, permission } = req.body;
        if (name === undefined) throw new Error(`folder name not provided...`);
        tags = tags.trim().split(",");
        if (tags[tags.length - 1] == "" || tags[tags.length - 1] == null || tags[tags.length - 1] == undefined) {
            tags = tags.splice(0, tags.length - 1);
        }
        data.name = name;
        data.tags = tags;
        data.createdBy = user.email;
        data.updatedBy = user.email;
        let ress = await service.create(data);
        let defpermi = await permissionsrv.create({createdBy:user.email,folder:ress.id})  //create default permission
        res.status(201).json(ress);
    } catch (error) {
        res.status(400).json({
            errmsg: error.message
        })
    }
}

const get_folder_bulk=async(req,res)=>{
    try {
        let {id} =req.params;
        id = Number.parseInt(id);
        if (isNaN(id)) {
            throw new Error(`folder id not provided..`);
        }
        let files = null;
        // if (req.user_data==null) {
            // files = await filesrv.get_by_folder(id,req.user_data,true,true);
        // }else{
        files = await filesrv.get_by_folder(id,req.user_data,true,true);
    // }
        let filepaths = files.map((val)=>{
            return {type:"file",name:val.metadata.name,path:val.metadata.path};
            // return val.metadata.path;
        });

       return filehandler.make_zip_2(filepaths,res);

    } catch (error) {
        res.status(400).json({
            errmsg:error.message
        })
    }
}

const post_folder_bulk=async(req,res)=>{
    try {
        let {folder} = req.files;
        let {folder_name}=req.body;
        if (folder==undefined||folder.length==0) {
            throw new Error(`no files uploaded..`);
        }
        if (folder_name==undefined||folder_name=="") {
            throw new Error(`folder name not provided..`);
        }
        let {user_data} = req;
     let folderx =  await service.create({name:folder_name,createdBy:user_data.email,updatedBy:user_data.email,tags:[folder_name]});
     let defpermi = await permissionsrv.create({createdBy:user_data.email,updatedBy:user_data.email,folder:folderx.id});
     let files = [];
     if (folder.length>=100) {
        throw new Error(`file limit exceeded than 100`);
     }
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
                    let pathx = "/uploads/"+name;
                    // let pathx = filehandler.move_file_to(file.data, `../uploads/${name}`);
                    file.mv(path.join(__dirname,".."+pathx),(err)=>{
                        if (err) {
                            console.log("err in uplaoding  : "+err)
                        }else{
                            console.log("file loaded : "+pathx)
                        }
                    })
                    // console.log("path is : ", pathx);
                    metadata = { ...metadata, path: pathx };
                    let filex = {
                        folder: folderx.id,
                        metadata: metadata,
                        createdBy: user_data.email,
                        updatedBy: user_data.email,
                        tags: [metadata.name]
                    }

                    let resp = await filesrv.create(filex);
                    await permissionsrv.create({createdBy:resp.createdBy,updatedBy:resp.updatedBy,file:resp.id});
                    files.push(resp.dataValues);
                }catch(er){
                    files.push({errmsg:er.message});
                }
        }
        folderx.files = files;
        res.status(201).json(folderx);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg:error.message
        });
    }
}

const get_folder =async (req, res) => {
    let { id } = req.params;
        try {
            if (id === undefined) throw new Error(`id not provided..`);
            let ress = await service.get_by_id(id,req.user_data);
            res.status(200).json(ress);
        } catch (error) {
            res.status(400).json({
                errmsg : error.message
            })
        }
   
}

const patch_folder=async(req,res)=>{
    let {id}=req.params;
    try {
        let data = {updatedBy:req.user_data.email,...req.body};
        let ress  = await service.updateFolder(id,data,req.user_data);
        res.status(200).json(ress);
    } catch (error) {
        // console.log(error);
        res.status(400).json({
            errmsg : error.message
        })
    }
}

const delete_folder=async(req,res)=>{
   let {id}= req.params;
   console.log(id);

    try {
        if(id==undefined) throw new Error(`folder id not provided..`);
        await service.delete_by_id(id,req.user_data);
        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg : error.message
        })
    }
}

const delete_multiple_folder=async(req,res)=>{
    let {ids}= req.query;
    console.log(ids);
     try {
         if(ids==undefined) throw new Error(`folder ids not provided..`);
           ids = ids.trim();
           ids = ids.replace('[','');
           ids = ids.replace(']','');
           ids = ids.split(',');
           ids.forEach(async(id) => {
                try {
                    await service.delete_by_id(Number.parseInt(id),req.user_data);
                } catch (error) {
                    console.log(error.message)
                }
           });
         res.status(204).send();
     } catch (error) {
        console.log(error)
         res.status(400).json({
             errmsg : error.message
         })
     }
 }
 
 const get_all_folder=async(req,res)=>{
    try {
   let ress = await service.get_all_folder(req.user_data.email);
   res.status(200).json(ress);
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            errmsg : error.message
        })
    }
 }

 const get_list_file=async(req,res)=>{
    try {
        let {id}=req.params; //id = folder(folderid)
        if (id==undefined) {
        throw new Error(`folder id not provided..`);
    }
        let resx = await filesrv.get_files_from_folder(Number.parseInt(id));
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        })
    }
 }

 const get_file_content=(req,res)=>{
        try {
       let { fid } = req.params;
       let {type} = req.query;
       if (type==undefined) {
           type = "full"
       }
       else  if (["full","thumb"].includes(type)) {
               type  = type;
           }
       else{
           type = "full";
       }
   
       let file = req.file_info;
       
   
       let pth = path.join(__dirname, ".." + file.metadata.path);
           if (file.metadata.mimetype.split("/")[0] == "image" && type=="thumb") {
               filehandler.gen_thumb_nail(pth, 460, 300, (err, data) => {
                   if (err!=null) {
                       sendError(res, err)
                   } else {
                       res.set('Content-Type', 'image/webp');
                       res.set('Content-Disposition', `inline; filename=${file.metadata.name}.webp`);
                     return  res.status(200).send(data);
                   }
               })
           }else{
            res.set('Content-Type', file.metadata.mimetype);
            // res.set('Content-Disposition', `inline; filename=${file.metadata.name}`);
            res.set('Content-Disposition', `attachment; filename=${file.metadata.name}`);
            res.set('Content-Length', file.metadata.size);

          let rfs  =  fs.createReadStream(pth);
          rfs.pipe(res);
        //   rfs.on("data",(chuk)=>{
        //     console.log(chuk);
        //   })
          rfs.on('error', (err) => {
            console.error('Error streaming file:', err);
            res.status(500).end('Internal Server Error');
          });
        //     res.status(200).sendFile(pth, (err) => {
        //        if (err) {
        //            res.status(500).send();
        //        } else {
        //            console.log(`file ${pth} sended..`);
        //        }
        //    });
       }
   }catch(error){
        console.log(error);
       res.status(400).send();
   }
   }

module.exports = { post_folder, get_folder ,patch_folder,delete_folder,delete_multiple_folder,get_all_folder,get_list_file,get_file_content,post_folder_bulk,get_folder_bulk}