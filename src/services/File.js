const model = require("../models/File");
const foldermdl = require("../models/Folder");
const filehandler = require('../services/FileHandler');
const path = require("path");
const metadatamdl = require("../models/FileMetadata");
const cryptosrv = require("../utils/CryptoGraph");
const filetimelinesrv = require("../services/FileAudit");
const permissionsrv = require("../services/Permission");
const commentsrv = require("../services/Explore");
const { Sequelize, Op } = require("sequelize");
const sync = async (type) => {
    await model.sync(type);
    console.log("file model synced..");
}

const create = async (obj) => {
    let file = await model.create(obj);
    return file;
}

const get_files_from_folder = async (id) => {
    let res = await model.findAll({
        where: {
            folder: id
        }
    });
    return res;
}

const get_by_id = async (id, user, raw = false) => {
    let res = await model.findOne({
        where: {
            id: id,
            createdBy: user.email
        }
    });
    // console.log(res);
    if (res == null) throw new Error(`file with id = ${id} not exist..`);
    if (raw) return res;
    return { ...res.dataValues };
}

const get_by_folder = async (folderid, user, admin, plain = false) => {
    let qryobj = { folder: folderid };
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    let res = await model.findAll({
        where: qryobj,
        raw: plain
    });
    if (res == null) throw new Error(`file with id = ${id} not exist..`);
    return res;
}

const read = async (id, raw = false) => {
    let res = await model.findByPk(id, {
        include: [{ model: metadatamdl, as: "fkey_file_metadata" }]
    });
    // console.log(res);
    if (res == null) throw new Error(`file with id = ${id} not exist..`);
    if (raw) return res;
    let metadata = res.dataValues.fkey_file_metadata;
    if (metadata == null) metadata = {};
    delete res.dataValues['fkey_file_metadata'];
    return { ...res.dataValues, file_metadata: metadata.dataValues };
}



const delete_file = async (id, user) => {
    let file = await get_by_id(id, user);
    let res = await model.destroy({
        where: {
            id: id,
            createdBy: user.email
        }
    });
    if (res > 0) {
        await filetimelinesrv.delete_timeline(id);
        await permissionsrv.delete_by_type_id({ file: id }, user);
       await commentsrv.delete_comment(id);
        try {
            filehandler.delete_file(path.join(__dirname, `..${file.metadata.path}`));
        } catch (error) {
            console.log(error);
        }
        
    }
    return res;
}

const delete_file_by_folder = async (folderid, user, admin) => {
    let qryobj = { folder: folderid };
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    let file = await get_by_folder(folderid, user, admin,true);
    let res = await model.destroy({
        where: qryobj
    });
    for (const f of file) {
        await permissionsrv.delete_by_type_id({file:f.id},user,admin);
        await filetimelinesrv.delete_timeline(f.id);
        await commentsrv.delete_comment(f.id);
        try {
            filehandler.delete_file(path.join(__dirname, `..${f.metadata.path}`));
        } catch (error) {
         console.log(error);   
        }
    }
}

const update = async (id, user, new_data) => {
    // console.log(new_data);
    let old = await get_by_id(id, user, true);
    if (old == null) {
        throw new Error(`file with id = ${id} not exist..`);
    }

    //tags updattion
    let { tags ,favorite} = new_data;
    // console.log(tags);
    if (tags != null || tags != undefined) {
        old.tags = tags;
    }
    if (favorite!=null||favorite!=undefined) {
        old.favorite = favorite;
    }

    let {like}=new_data;
    if (like!=undefined||like!="") {
        old.like = old.like+1;
    }
    let {dislike}=new_data;
    if (dislike!=undefined||dislike!="") {
        old.dislike = old.dislike+1;
    }

    let { password } = new_data;
    if (password != undefined) {
        password = cryptosrv.encrypt(password);
        old.password = password;
    } else {
        old.password = null;
    }
    //userupdattion..
    old.updatedBy = user.email;

    await old.save();
    return old.dataValues;
}

const get_recent=async(from,to,user,admin=null)=>{
    from = Number.parseInt(from);
    to = Number.parseInt(to);
    if (isNaN(from)||isNaN(to)) {
        throw new Error(`invalid value for from=${from} && to=${to}`);
    }
    let query = {};
    if (admin == null || admin == false) {
        query.createdBy = user.email;
    }
    let res = await model.findAll({
        where:{
            [Op.and]: [
                Sequelize.where(
                  Sequelize.literal(`(EXTRACT(EPOCH FROM "createdAt") * 1000)`),
                  { [Op.gte]: from } 
                ),
                Sequelize.where(
                  Sequelize.literal(`(EXTRACT(EPOCH FROM "createdAt") * 1000)`),
                  { [Op.lte]: to } 
                ),
              ],
              ...query
        },
        raw:true
    });
    return res;
}

const update_by_id = async (id, new_data) => {
    let old = await model.findOne({ where: { id: id } });
    if (old != null) {
        console.log(old.dataValues);
        let { downloads } = new_data;
        if (downloads != undefined) {
            old.downloads = downloads;
        }
        await old.save();
    }
    return old.dataValues;
}

const get_in_range = async (from, to, user, admin = null,favorite=false) => {
    let gap = to;
    if (!(gap >= 0 && gap <= 30)) {
        throw new Error(`invalid range to = ${gap} must be in 30`)
    }
    let query = {};
    if (admin == null || admin == false) {
        query.createdBy = user.email;
    }
    if (favorite==true) {
        query.favorite=true;
    }
    let res = await model.findAll({
        where: query,
        offset: from,
        limit: to,
        raw: true
    });
    return res;
}

const get_all_details = async (id, plain = true) => {
    let res = await model.findOne({
        where: {
            id: id
        },
        raw: plain
    });
    let permission = await permissionsrv.read_by_type_id({ file: id }, null, false, true);
    res.permission = permission.data;
    // console.log("lol",res);
    return res;
}

// setTimeout(async() => {
//    await update(69,'svlmehul@gmail.com',{});
// }, 500);

module.exports = { sync, create, get_files_from_folder, delete_file, get_by_id, read, update, update_by_id, get_in_range, get_all_details, delete_file_by_folder, get_by_folder,get_recent }