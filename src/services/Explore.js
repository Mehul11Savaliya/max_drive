const { Op } = require("sequelize");
const permissionmdl = require("../models/Permission");
const filemdl = require("../models/File");
const get_public_files = async (from = 0, limit = 10, all = false) => {
    let res = await filemdl.findAll({
        include: [{
            model: permissionmdl, as: "file_permission",
            where: {
                data: {
                    share_settings: {
                        is_public: {
                            [Op.eq]: true
                        }
                    }
                }
            }, attributes: []
        }],
        where: {
            metadata: {
                mimetype: {
                    [Op.or]: [{
                        [Op.like]: "image/%"
                    }, {
                        [Op.like]: "video/%"
                    }]
                }
            },
            password: null
        },
        attributes: ["metadata", "tags", "id", 'createdAt', 'updatedAt', 'createdAt', 'updatedAt', 'createdBy'],
        offset: from,
        limit: limit
    });
    let i = from;
    res = res.map((val) => {
        return { index: i++, ...val.dataValues }
    });
    res = [{ start: from, end: from + limit }].concat(res);
    return res;
}

// (async()=>{
//    console.log(await get_public_files());
// })()

module.exports = { get_public_files }