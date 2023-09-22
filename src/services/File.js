const model = require("../models/File");
const foldermdl = require("../models/Folder");
const filehandler = require('../services/FileHandler');
const path = require("path");
const metadatamdl = require("../models/FileMetadata");

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
        include:[{model:metadatamdl,as:"fkey_file_metadata"}],
        where :{
            createdBy:user.email
        }
    });
        // console.log(res);
    if(res==null) throw new Error(`file with id = ${id} not exist..`);
    if(raw) return res;
    let metadata = res.dataValues.fkey_file_metadata;
    if(metadata==null) metadata={};
    delete res.dataValues['fkey_file_metadata'];
     return {...res.dataValues,file_metadata:metadata.dataValues};
}

const read=async(id,raw=false)=>{
    let res = await model.findByPk(id,{
        include:[{model:metadatamdl,as:"fkey_file_metadata"}]
    });
        // console.log(res);
    if(res==null) throw new Error(`file with id = ${id} not exist..`);
    if(raw) return res;
    let metadata = res.dataValues.fkey_file_metadata;
    if(metadata==null) metadata={};
    delete res.dataValues['fkey_file_metadata'];
     return {...res.dataValues,file_metadata:metadata.dataValues};
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

const update=async(id,user,new_data)=>{
    console.log(new_data);
    let old  = await get_by_id(id,user,true);
    if (old==null) {
        throw new Error(`file with id = ${id} not exist..`);
    }

    //tags updattion
    let {tags} = new_data;
    // console.log(tags);
    if (tags!=null||tags!=undefined) {
        old.tags = tags;
    }
    //userupdattion..
    old.updatedBy = user;
    
    await old.save();
    return old.dataValues;
}

// setTimeout(async() => {
//    await update(69,'svlmehul@gmail.com',{});
// }, 500);

module.exports={sync,create,get_files_from_folder,delete_file,get_by_id,read,update}