const model = require("../models/File");
const foldermdl = require("../models/Folder");

const sync=async()=>{
    await model.sync({force:true});
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

module.exports={sync,create,get_files_from_folder}