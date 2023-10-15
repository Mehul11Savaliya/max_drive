const model = require("../models/Folder");
const filemdl = require("../models/File");
const { Sequelize } = require("sequelize");

const permissionsrv = require("./Permission");
const filesrv = require("../services/File");
const { encrypt } = require("../utils/CryptoGraph");

const timelinesrv = require("./FolderAudit");

const sync = async (syntype) => {
    await model.sync(syntype);
    console.log(model.name, "synced..");
}

const create = async (obj) => {
    let folder = await model.create(obj);
    return folder.dataValues;
}

const get_by_id = async (id,user,admin=false, raw = false) => {
    let qryobj = { id: id };
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    let res = await model.findOne({
        where:qryobj,
        raw:!raw});  //if raw = tru so we have to invert it if ve want raw
    // let res = await model.findByPk(id);
    if (res == null) throw new Error(`folder with id = ${id} not exist..`);
    return res;
}

const updateFolder=async(id,data,user,admin)=>{
    let qryob = {id:id};
    if (!admin) {
        qryob.createdBy = user.email;
    }
    let old  = await get_by_id(id,user,admin,true);
    let {name,tags,isDeleted,password} = data;
    console.log(data);
    if(name!==undefined)
    old.name = name;
    
    if(tags!==undefined){
        // tags = tags.trim().split(',');
        // tags = tags.slice(0,tags.length);
        // tags = tags.filter((val)=>{
        //     if(val!=="") return val;        })
        old.tags = tags;
    }

    if (password!==undefined) {
        if (password=="") 
            old.password = null;
        else
        old.password = encrypt(password);
    }
    if(isDeleted!==undefined)
    old.isDeleted = isDeleted;
    old.updatedBy = data.updatedBy
       
    return await old.save();
}

const delete_by_id=async(id,user,admin=false)=>{
    // let old = await get_by_id(id,user,admin,true);
    // let persid  = old.permission;
    let qryobj = { id: id };
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    let res = await model.destroy({
        where:qryobj
    });
    await filesrv.delete_file();
    await permissionsrv.delete_by_type_id({folder:id},user,admin);
    await timelinesrv.delete_timeline(id,user,admin);
    if(res==0) throw new Error(`not able to delete a folder with id = ${id}`)
    else return res;
}

const get_all_folder=async(user)=>{
let res  = await model.findAll({
        include:[{
            model:filemdl,
            as:"files",
            attributes:['folder']
        }],
        where : {
            createdBy : user
        },
        attributes:[[Sequelize.literal(`folder."id"`),"id"],[Sequelize.literal(`folder."name"`),"name"],"createdAt","updatedAt",Sequelize.literal(`COUNT(files."id")`)],
        group:['folder.id',"files.folder"],
        order:[['updatedAt',"ASC"]],
        raw:true
});
return res;
}

const get_all_details=async(id,plain=true)=>{
    let res = await model.findOne({
        where:{
            id:id
        },
        raw:plain
    });
    let permission = await permissionsrv.read_by_type_id({folder:id},null,false,true);
    res.permission = permission.data;
    return res;
}

// setTimeout(async() => {
//     console.log((await get_all_folder("svlmehul@gmail.com")));
// }, 500);

module.exports = { sync, create, get_by_id,updateFolder,delete_by_id,get_all_folder,get_all_details}