const service = require("../services/Bugs");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");

const post_bug = async (req, res) => {
    try {
        let { title, description } = req.body;
        let { user_data } = req;
        if (user_data == null) {
            req.body.owner = null;
        } else {
            req.body.owner = user_data.username;
        }
        if (title == undefined || title == "") {
            throw new Error(`title not provided..`)
        }
        let attachmentsa = [];
        if (req.files != null && req.files.attachments != undefined) {
            let { attachments } = req.files;
            console.log(attachments);
            if (attachments.length != undefined) {
                for (let index = 0; index < attachments.length; index++) {
                    const attachment = attachments[index];
                    if (attachment.size < 20971520) {
                        let name = `/uploads/bugs/${uuid.v4()}.${attachment.name.split('.').pop()}`;
                        attachment.mv(path.join(__dirname, ".." + name), (err) => {
                            if (err) {
                                console.log("not able to upload file ", name, attachments.name);
                            } else {
                                attachmentsa.push(name);
                                console.log("file created ", name);
                            }
                        })
                    }
                }
            } else {
                let name = `/uploads/bugs/${uuid.v4()}.${attachments.name.split('.').pop()}`;
                if (attachments.size < 20971520) {
                    attachments.mv(path.join(__dirname, ".." + name), (err) => {
                        if (err) {
                            console.log("not able to upload file ", name, attachments.name);
                        } else {
                            attachmentsa.push(name);
                            console.log("file created ", name);
                        }
                    })
                }
            }
        }
        let resx = await service.create(req.body, attachmentsa);
        res.status(201).json(resx);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        })
    }
}

const get_bugs = async (req, res) => {
    try {
        let resx = await service.get_all();
        res.status(200).json(resx);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        })
    }
}

const delete_bug = async (req, res) => {
    try {
        let { id } = req.params;
        let { files } = req.query;

        if (id == "" || id == undefined) {
            throw new Error(`bud id not valid`);
        }

        let resx;
        if ((files != undefined || files != "") && (files == "true" || files === true)) {
            resx = await service.delete_bug(id, true);
        } else {
            resx = await service.delete_bug(id, false);
        }

        console.log("bug delete info : ".bgRed + JSON.stringify(resx));
        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
}

const update_status=async(req,res)=>{
    try {
        let { id } = req.params;
        let {status}=req.body;
        console.log(req.body);
        if (!["open","close","inprogress"].includes(status)) {
            throw new Error(`invalid status..`);
        }
       let resx;
       resx = await service.update_bug_status(id,status);

        console.log("bug update info : ".bgBlue + JSON.stringify(resx));
        res.status(200).json(resx);
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
}

module.exports = { post_bug, get_bugs, delete_bug,update_status }