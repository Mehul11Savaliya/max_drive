const model = require("../models/FileMetadata");

const sync = async () => {
    await model.sync({ alter: true });
}

const create = async (data) => {
    let created = await model.create(data);
    return created;
}

const remove = async (id) => {
    let res = await model.destroy({
        where: {
            file: id
        }
    });
    if (res == 0) throw new Error(`not able to delete data with id  = ${id}`);
    return res;
}

const read = async (id, raw = false) => {
    let res = await model.findOne({
        where: {
            file: id
        }
    })
    if (res == null) throw new Error(`data with id = ${id} not exist..`);
    return raw ? res : res.dataValues;
}

const update = async (id, newobj) => {
    let { share_settings, updatedBy, file } = newobj;
    let {
        share_with,
        is_public,
        is_unlimited,
        available_time, available_date,
        max_share_limit } = share_settings;
    let old = await read(id,true);
    old.updatedBy = updatedBy;
    old.file = file;
    if(share_with!=undefined)
    old.share_settings.share_with = share_with;
    if(is_public!=undefined)
    old.share_settings.is_public = is_public;
    if(is_unlimited!=undefined)
    old.share_settings.is_unlimited = is_unlimited;
    if(available_date!=undefined)
    old.share_settings.available_date=available_date;
    if(available_time!=undefined)
    old.share_settings.available_time = available_time;
    if(max_share_limit!=undefined)
    old.share_settings.max_share_limit = max_share_limit;
        old.changed("share_settings",true);
    await old.save();
        return old.dataValues;
}

module.exports = { sync, create, remove, read, update };