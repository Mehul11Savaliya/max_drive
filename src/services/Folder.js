const model = require("../models/Folder");

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

module.exports = { sync, create, get_by_id }