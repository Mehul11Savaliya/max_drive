const model = require("../models/Folder");
const filemdl = require("../models/File");
const { Sequelize } = require("sequelize");

const sync = async () => {
    await model.sync({ force: true });
    console.log(model.name, "synced..");
}

const create = async (obj) => {
    let folder = await model.create(obj);
    return folder.dataValues;
}

const get_by_id = async (id, raw = false) => {
    let res = await model.findByPk(id);
    if (res == null) throw new Error(`folder with id = ${id} not exist..`);
    if (raw) return res;
    return res.dataValues;
}

const updateFolder=async(id,data)=>{
    let old  = await get_by_id(id,true);
    let {name,permissions,tags,isDeleted} = data;
    if(name!==undefined)
    old.name = name;
    if(permissions!==undefined)
    old.permissions = permissions;
    if(tags!==undefined){
        tags = tags.trim().split(',');
        tags = tags.slice(0,tags.length);
        tags = tags.filter((val)=>{
            if(val!=="") return val;        })
        old.tags = tags;
    }
    if(isDeleted!==undefined)
    old.isDeleted = isDeleted;
    old.updatedBy = data.updatedBy
       
    return await old.save();
}

const delete_by_id=async(id)=>{
    let res  = await model.destroy({
        where :{
            id  : id
        }
    });
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

// setTimeout(async() => {
//     console.log((await get_all_folder("svlmehul@gmail.com")));
// }, 500);

module.exports = { sync, create, get_by_id,updateFolder,delete_by_id,get_all_folder}