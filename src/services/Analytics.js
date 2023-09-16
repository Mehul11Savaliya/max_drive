const { Op, Sequelize } = require("sequelize");
const filemdl = require("../models/File");
const foldermdl = require("../models/Folder");

const get_files=async(user=null,from=0,limit=0,is_admin=false)=>{
    if (limit>20) {
        limit = 20
    }
    if (user==null&&is_admin==false) {
        throw new Error(`u should have admin right or u are user`)
    }
const res = await filemdl.findAll({
    where:{
        createdBy : user
    },
    offset:from,
    limit:limit,
     attributes:[[Sequelize.literal(`metadata->>'name'`),'name'],[Sequelize.literal(`metadata->>'size'`),'size'],[Sequelize.literal(`metadata->>'path'`),'path'],"createdBy","updatedBy","updatedAt","id","folder"]   
});
return res.map((value)=>{
    return {
        id:value.id,
        folder : value.folder,
        name : value.dataValues.name,
        path:value.dataValues.path,
        size : value.dataValues.size,
        author  : value.createdBy,
        editor : value.updatedBy,
        lastedit : value.updatedAt
    }
})
}

// (async()=>{
//     console.log(await get_files());
// })()

module.exports={
    get_files
}