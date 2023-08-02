const model = require("../models/File");
const foldermdl = require("../models/Folder");
const filehandler = require('../services/FileHandler');
const path = require("path");

const sync=async()=>{
    await model.sync({alter:true});
    console.log("file model synced..");
}

const create=async(obj)=>{
    let file = await model.create(obj);
    return file;
}

const get_files_from_folder=async(id)=>{
    let res  = await model.findAll({
        where:{
            folder : id
        }
    });
    return res;
}

const get_by_id=async(id,user,raw=false)=>{
    let res = await model.findByPk(id,{
        where :{
            createdBy:user.email
        }
    });
        // console.log(res);
    if(res==null) throw new Error(`file with id = ${id} not exist..`);
    if(raw) return res;
     return res.dataValues;
}

const delete_file=async(id,user)=>{
    let file  = await get_by_id(id,user);
    let res = await model.destroy({
        where:{
            id : id,
            createdBy : user.email
        }
    });
    if(res>0){
        filehandler.delete_file(path.join(__dirname,`..${file.metadata.path}`));
    }
    return res;
}

module.exports={sync,create,get_files_from_folder,delete_file,get_by_id}