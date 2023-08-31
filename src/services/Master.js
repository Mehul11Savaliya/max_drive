const { Op } = require("sequelize");
const modal = require("../models/Master");

const sync = async () => {
    await modal.sync({ alter: true });
}

const create = async (obj) => {
    let res = await modal.create(obj);
    return res.dataValues;
}

const filter = async (filterobj) => {
    let { type, key, value, id } = filterobj;
    if (type == undefined)
        type = null;
    if (key == undefined)
        key = null;
    if (value == undefined)
        value = null;
    if (id == undefined)
        id = null;
    let res = await modal.findAll({
        where: {
            [Op.or]: [{ type: type }, { key: key }, { value: value }, { id: id }]
        }
    });

    return res;
}

module.exports = { sync, create, filter };