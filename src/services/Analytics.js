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
     attributes:[[Sequelize.literal(`metadata->>'name'`),'name'],[Sequelize.literal(`metadata->>'size'`),'size'],"createdBy","updatedBy","updatedAt","id","folder"]   
});
return res.map((value)=>{
    return {
        id:value.id,
        folder : value.folder,
        name : value.dataValues.name,
        size : value.dataValues.size,
        author  : value.createdBy,
        editor : value.updatedBy,
        lastedit : value.updatedAt
    }
})
}

const get_index_documents=async(user=null,from=0,limit=0,is_admin=false)=>{
    if (limit>20) {
        limit = 20
    }
    if (user==null&&is_admin==false) {
        throw new Error(`u should have admin right or u are user`)
    }
const res = await filemdl.findAll({
    where:{
        [Op.and]:[ Sequelize.literal(`substring(metadata->>'name' from '\.([^.]+)$') in ('pdf','docx','xlzx','csv','pptx')`),{createdBy : user}]
        
    },
    offset:from,
    order:[["updatedAt","DESC"]],
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

const get_total_space_usage=async(user=null,is_admin=false)=>{
    let data  ={};
    if (user==null&&is_admin==false) {
        throw new Error(`invalid user or must be admin..`)
    }
    let res  = await filemdl.findAll({
        where:{
            createdBy:user
        },
        attributes:[[Sequelize.literal(`SUM(CAST(metadata->>'size' AS integer))`),'size']]
    });
    data.used  =res[0].dataValues.size 
    let resx  = await filemdl.findAll({
        where:{
            createdBy:user
        },
        group:['month'],
        attributes:[[Sequelize.literal(`SUM(CAST(metadata->>'size' AS integer))`),'size'],[Sequelize.literal('EXTRACT(MONTH FROM "createdAt")'), 'month']]
     });
    data.monthly_usage=[];
    resx.forEach((val)=>{
        data.monthly_usage.push(val.dataValues);
    })
    //for daily usage..
    // where:{
    //     createdBy:user
    // },
    // attributes:[[Sequelize.literal(`CAST(metadata->>'size' AS integer)`),'size'],[Sequelize.literal('EXTRACT(MONTH FROM "createdAt")'), 'month'],'createdAt']
    return data;
}

// (async()=>{
//     console.log(await get_files());
// })()

// setTimeout(async() => {
//     console.time("time")
//   await  get_total_space_usage('svlmehul@gmail.com');
//   console.timeEnd("time")
//     // console.log(await get_index_documents("svlmehul@gmail.com",0,10))
// }, 500);

module.exports={
    get_files,
    get_index_documents,
    get_total_space_usage
}