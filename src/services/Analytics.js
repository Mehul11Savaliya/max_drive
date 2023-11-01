const { Op, Sequelize } = require("sequelize");
const filemdl = require("../models/File");
const foldermdl = require("../models/Folder");

const get_files = async (user = null, from = 0, limit = 0, is_admin = false) => {
    if (limit > 20) {
        limit = 20
    }
    if (user == null && is_admin == false) {
        throw new Error(`u should have admin right or u are user`)
    }
    const res = await filemdl.findAll({
        where: {
            createdBy: user
        },
        offset: from,
        limit: limit,
        attributes: [[Sequelize.literal(`metadata->>'name'`), 'name'], [Sequelize.literal(`metadata->>'size'`), 'size'], "createdBy", "updatedBy", "updatedAt", "id", "folder"]
    });
    return res.map((value) => {
        return {
            id: value.id,
            folder: value.folder,
            name: value.dataValues.name,
            size: value.dataValues.size,
            author: value.createdBy,
            editor: value.updatedBy,
            lastedit: value.updatedAt
        }
    })
}

const get_index_documents = async (user = null, from = 0, limit = 0, is_admin = false) => {
    if (limit > 20) {
        limit = 20
    }
    if (user == null && is_admin == false) {
        throw new Error(`u should have admin right or u are user`)
    }
    const res = await filemdl.findAll({
        where: {
            [Op.and]: [Sequelize.literal(`substring(metadata->>'name' from '\.([^.]+)$') in ('pdf','docx','xlzx','csv','pptx')`), { createdBy: user }]

        },
        offset: from,
        order: [["updatedAt", "DESC"]],
        limit: limit,
        attributes: [[Sequelize.literal(`metadata->>'name'`), 'name'], [Sequelize.literal(`metadata->>'size'`), 'size'], [Sequelize.literal(`metadata->>'path'`), 'path'], "createdBy", "updatedBy", "updatedAt", "id", "folder"]
    });
    return res.map((value) => {
        return {
            id: value.id,
            folder: value.folder,
            name: value.dataValues.name,
            path: value.dataValues.path,
            size: value.dataValues.size,
            author: value.createdBy,
            editor: value.updatedBy,
            lastedit: value.updatedAt
        }
    })
}

const get_total_space_usage = async (user = null, is_admin = false) => {
    let data = {};
    if (user == null && is_admin == false) {
        throw new Error(`invalid user or must be admin..`)
    }
    let res = await filemdl.findAll({
        where: {
            createdBy: user
        },
        attributes: [[Sequelize.literal(`SUM(CAST(metadata->>'size' AS bigint))`), 'size']]
    });
    data.used = res[0].dataValues.size
    let resx = await filemdl.findAll({
        where: {
            createdBy: user
        },
        group: ['month'],
        attributes: [[Sequelize.literal(`SUM(CAST(metadata->>'size' AS bigint))`), 'size'], [Sequelize.literal('EXTRACT(MONTH FROM "createdAt")'), 'month']]
    });
    data.monthly_usage = [];
    resx.forEach((val) => {
        data.monthly_usage.push(val.dataValues);
    })
    //for daily usage..
    // where:{
    //     createdBy:user
    // },
    // attributes:[[Sequelize.literal(`CAST(metadata->>'size' AS integer)`),'size'],[Sequelize.literal('EXTRACT(MONTH FROM "createdAt")'), 'month'],'createdAt']
    return data;
}

const get_storage_stats = async (gap, user = null, is_admin = false) => {
    let groupby = null;
    let attributes = null;
    order=[];
    switch (gap) {
        case 'weekly':
            break;
        case 'monthly':
            groupby = ['month'];
            attributes = [[Sequelize.literal(`SUM(CAST(metadata->>'size' AS integer))`), 'size'], [Sequelize.literal(`EXTRACT(MONTH FROM "createdAt")`), 'month']];
            order = [['month','ASC']];
            break;
        case 'yearly':
            groupby = ['year'];
            attributes = [[Sequelize.literal(`SUM(CAST(metadata->>'size' AS integer))`), 'size'], [Sequelize.literal(`EXTRACT(YEAR FROM "createdAt")`), 'year']];
            order = [['year','ASC']];
            break;
        default:
            throw new Error(`invalid gap provided..`);
    }

    let resx = await filemdl.findAll({
        where: {
            createdBy: user
        },
        group: groupby,
        attributes: attributes,
        order:order
    });

    resx= resx.map((val) => {
        return val.dataValues;
    }
    )
    return resx;
}

const search=async(qry,user,is_admin)=>{
    let files  = await filemdl.findAll({
        where:{
            createdBy : user,
            updatedBy : user,
            [Op.or]:[{tags:{
                [Op.contains]:[qry]
            }},{metadata: {
                [Op.or]: [
                  { 'name': { [Sequelize.Op.iLike]: `%${qry}%` } }, // Case-insensitive search on the "name" field in metadata
                  { 'mimetype': { [Sequelize.Op.iLike]: `%${qry}%` } },// Case-insensitive search on the "mimetype" field in metadata
                  { 'size': { [Sequelize.Op.eq]: isNaN(Number.parseInt(qry))?0: Number.parseInt(qry)} }, // Exact match on the "size" field in metadata
               
               ],
              }}]           
        },
        limit:10
    });
     files  = files.map((val)=>{
        return {
            id : val.dataValues.id,
            name : val.dataValues.metadata.name,
            mime : val.dataValues.metadata.mimetype
        }
     })
     return files;
}

const uploads_and_downloads=async(user)=>{
    let {email} = user;
    if (email==undefined) {
        throw new Error(`invalid email..`);
    }
    let res  = await filemdl.findAll({
        where:{
            createdBy : email
        },
        attributes:[[Sequelize.literal(`count(file.id)`),"uploads"],[Sequelize.literal(`sum(file.downloads)`),"downloads"],
                    [Sequelize.literal(`EXTRACT(MONTH FROM file."createdAt")`),"month"]],
        group:['month'],
        raw:true
    })   
    let totalups=0,totaldowns=0;
    res.forEach((val)=>{
        totalups+=Number.parseInt(val.uploads);
        totaldowns+=Number.parseInt(val.downloads);
    })
    return {
            uploads : totalups,
            downloads : totaldowns,
            data : res
    }
}

// (async()=>{
//     console.log(await get_files());
// })()

// setTimeout(async() => {
    // console.time("time")
//   await  get_total_space_usage('svlmehul@gmail.com');
//   console.timeEnd("time")
    // console.log(await get_index_documents("svlmehul@gmail.com",0,10))
//    await get_storage_stats('yearly','svlmehul@gmail.com')
//     console.log(await uploads_and_downloads({email:'svlmehul@gmail.com'}));
// }, 500);

module.exports = {
    get_files,
    get_index_documents,
    get_total_space_usage,
    get_storage_stats,
    search,
    uploads_and_downloads
}