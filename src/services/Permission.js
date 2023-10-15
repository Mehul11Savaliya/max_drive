const model = require("../models/Permission");
const notifemmiter = require("../subscriber/Notification");


const sync = async (action) => {
    await model.sync(action);
    console.log("permission model synced");
}

const create = async (data, dummy = false) => {
    // let res  = null;    
    // let data = {share_settings};
    // if (dummy) {
    //         res  = await model.create({
    //                 data:{share_settings:dummyshare}
    //         });
    //         return res.dataValues;  
    //     }
    let res = null;
    res = await model.create({
        data: { "share_settings": {} },
   ...data
    });
    return res;
}

const read_by_id = async (id, user, raw = false, admin = false) => {
    let qryobj = { id: id };
    let res = null;
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    res = await model.findOne({
        where: qryobj,
        raw: !raw
    });
    if (res == null) {
        throw new Error(`permission with id = ${id} not exist.`);
    }
    return res;
}

const read_by_type_id = async (typeob, user, raw = false, admin = false) => {
    let qryobj = typeob;
    let res = null;
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    res = await model.findOne({
        where: qryobj,
        raw: !raw
    });
    if (res == null) {
        throw new Error(`permission with typeid = ${JSON.stringify(typeob)} not exist.`);
    }
    return res;
}

const delete_by_id = async (id, user, admin = false) => {
    let qryobj = { id: id };
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    let res = await model.destroy({
        where: qryobj
    });
    if (res == 0) {
        throw new Error(`not able to delete permission with id = ${id}`);
    }
    return res;
}

const delete_by_type_id = async (typeob, user, admin = false) => {
    let qryobj = typeob;
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    let res = await model.destroy({
        where: qryobj
    });
    if (res == 0) {
        throw new Error(`not able to delete permission with type-id = ${JSON.stringify(typeob)}`);
    }
    return res;
}

const update_type_id = async (typeob, data, user, admin = false) => {
    let qryobj = typeob;
    if (!admin) {
        qryobj.createdBy = user.email;
    }
    let old = await read_by_type_id(typeob, user, true, admin);
    let {share_settings} = data;
  
    if (share_settings!=undefined) {
       
    let {
        share_with,
        is_public,
        is_unlimited,
        available_time,
        available_date,
        max_share_limit } = share_settings;
    if (share_with != undefined){
        
        share_with = share_with.split(',').map((val) => {
            // console.log("lol");
            // notifemmiter.
            notifemmiter.emit("push-notification",{
                author:user.email,
                to:val,
                msg:(Object.keys(typeob).includes("folder"))?`folder is shared `:(Object.keys(typeob).includes("file"))?"file is shared":"something else",
                data:{
                    url : (Object.keys(typeob).includes("folder"))?`/share/folder/${typeob.folder}`:(Object.keys(typeob).includes("file"))?`/share/file/${typeob.file}`:""
                }
            });
            return (val != '') ? val : null;
        })
    old.data.share_settings.share_with = share_with;
}
    if (is_public != undefined)
        old.data.share_settings.is_public = is_public == 'on' ? true : false;
    else
        old.data.share_settings.is_public = false;
    if (is_unlimited != undefined)
        old.data.share_settings.is_unlimited = is_unlimited == 'on' ? true : false;
    else
        old.data.share_settings.is_unlimited = false;
    if (available_date != undefined)
        old.data.share_settings.available_date = available_date;
    if (available_time != undefined)
        old.data.share_settings.available_time = available_time;
    if (max_share_limit != undefined)
        old.data.share_settings.max_share_limit = max_share_limit;
    }
    old.changed("data", true);

    old.updatedBy = user.email;
    return (await old.save()).dataValues;
}

module.exports = { sync, create, update_type_id, delete_by_id, delete_by_type_id, read_by_type_id };