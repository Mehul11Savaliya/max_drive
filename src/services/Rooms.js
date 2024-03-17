const model = require("../models/Room");
const filehandler = require("../services/FileHandler");
const path = require("path");

const sync=async(type)=>{
    await model.sync(type);
    console.log("room model synced..");
}

const create=async(data,user)=>{
    data.createdBy = user.email;
    let res  = await model.create(data);
    return res.dataValues;
}

const read_room=async(id,user,admin=false,all=false,plain=false)=>{
    let qrob = {id:id};
    let res = null;
    if (all) {
        res = await model.findAll({raw:plain});
        return res;
    }
    if (!admin) {
       qrob.createdBy = user.email; 
    }
    if (id==null) {
        delete qrob['id'];
    }
    res = await model.findOne({
        where:qrob,
        raw:plain
    });
    return res;
}

const delete_by_id=async(id,user,admin=false)=>{
    let qrob = {id:id};
    if (!admin) {
       qrob.createdBy = user.email; 
    }
    let res  = await read_room(id,user,admin,false);
    if (res==null) {
        throw new Error(`room with id = ${id} not exist..`);
    }
    filehandler.delete_file(path.join(__dirname,".."+res.data.thumbnail));
    return await model.destroy({where:qrob});
}

module.exports={sync,create,delete_by_id,read_room}