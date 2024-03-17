const { Op } = require("sequelize");
const permissionmdl = require("../models/Permission");
const filemdl = require("../models/File");
const mongosrv = require("../config/mongodb");

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
        attributes: ["metadata", "tags", "id", 'createdAt', 'updatedAt', 'createdAt', 'updatedAt', 'createdBy','like','dislike'],
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

const add_comment=async(fileid,user,data)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("explore_comments");
        let comment = {};
        comment.user = user.email,
        comment.userid = user.id,
        comment.time = Date.now();
        comment.text = data.text;
        comment.username = user.username;
        comment.file = data.fileid||fileid;
        let res = await collection.insertOne(comment);
        return comment;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

const get_comments=async(fileid)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("explore_comments");
        let res = await collection.find({file:fileid}).sort({ time: -1 }).toArray();
        return res;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

const delete_comment=async(fileid)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("explore_comments");
        let res = await collection.deleteMany({file:fileid});
        console.log(res);
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

module.exports = { get_public_files ,add_comment,get_comments,delete_comment}