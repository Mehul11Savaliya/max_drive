const filemetadatsrv = require("../services/FileMetadata");

const get_germissions = (req, res) => {
    res.status(503).send();
}

const get_file_metadata = async (req, res) => {
    try {
        let { id } = req.params;
        if (id == undefined) throw new Error(`id not provided..`);
        const resx = await filemetadatsrv.read(id);
        res.status(200).json(resx);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const post_file_metadata = async (req, res) => {
    try {
        // let {email}= req.user_data;
        let email = "svlmehul@gmail.com";
        let obj = {};
        let { sharewith, available_time, availabel_date, max_limit, make_public, unlimited_access } = req.body;
        let { id } = req.params;
        if (sharewith == null || make_public == null || sharewith == undefined || make_public == undefined || id == undefined) {
            throw new Error(`invalid request..`)
        }
        obj.createdBy = email;
        obj.updatedBy = email;
        obj.file = id;

        let share_settings = {};
        share_settings.available_time = available_time;
        share_settings.available_date = availabel_date;
        share_settings.is_public = (make_public == "on") ? true : false;
        share_settings.share_with = sharewith.split(',');
        share_settings.is_unlimited = (unlimited_access == "on") ? true : false;
        share_settings.max_share_limit = max_limit;

        obj.share_settings = share_settings;

        const resx = await filemetadatsrv.create(obj);
        res.status(201).json(resx);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const patch_file_metadata = async (req, res) => {
    try {
        // let {email}= req.user_data;
        let email = "svlmehul@gmail.com";
        let obj = {};
        let { sharewith, available_time, availabel_date, max_limit, make_public, unlimited_access } = req.body;
        let { id } = req.params;
        if ((sharewith == null && make_public == null && sharewith == undefined && make_public == undefined) || id == undefined) {
            throw new Error(`invalid request..`)
        }
        obj.updatedBy = email;
        let share_settings = {};
        share_settings.available_time = available_time;
        share_settings.available_date = availabel_date;  //available spelling is different..
        share_settings.is_public = (make_public == "on") ? true : false;
        share_settings.share_with = sharewith.split(',');
        share_settings.is_unlimited = (unlimited_access == "on") ? true : false;
        share_settings.max_share_limit = max_limit;

        obj.share_settings = share_settings;
        const resx = await filemetadatsrv.update(id, obj);
        res.status(200).json(resx);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const delete_file_metadata = async (req, res) => {
    try {
        let { id } = req.params;
        if (id == undefined) throw new Error(`id not provided..`);

        let resx = await filemetadatsrv.remove(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({
            errmsg: error.message
        });
    }
}

module.exports = {
    get_germissions,
    get_file_metadata,
    post_file_metadata,
    patch_file_metadata,
    delete_file_metadata
};