const service = require("../services/Folder");

const post_folder = async (req, res) => {
    try {
        let user  = req.user_data;
        let data = {};
        let { name, tags, permission } = req.body;
        if (name === undefined) throw new Error(`folder name not provided...`);
        tags = tags.trim().split(",");
        if (tags[tags.length - 1] == "" || tags[tags.length - 1] == null || tags[tags.length - 1] == undefined) {
            tags = tags.splice(0, tags.length - 1);
        }
        data.name = name;
        data.tags = tags;
        data.permission = 1; //1 write
        data.createdBy = user.email;
        data.updatedBy = user.email;
        let ress = await service.create(data);
        res.status(201).json(ress);
    } catch (error) {
        res.status(400).json({
            errmsg: error.message
        })
    }
}

const get_folder =async (req, res) => {
    let { id } = req.params;
        try {
            if (id === undefined) throw new Error(`id not provided..`);
            let ress = await service.get_by_id(id);
            res.status(200).json(ress);
        } catch (error) {
            res.status(400).json({
                errmsg : error.message
            })
        }
   
}

module.exports = { post_folder, get_folder }