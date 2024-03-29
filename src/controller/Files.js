const path = require("path");
const fs = require("fs");

const service = require("../services/File")
const foldersrv = require("../services/Folder")
const { encrypt_file_v2, decrypt_file_v2 } = require("../services/FileHandler");
const commssrv = require("../services/Communication");
const metadatasrv = require("../services/FileMetadata");
const tokensrv = require("../services/Token");
const usersrv = require("../services/User");
const permissionsrv = require("../services/Permission");
const notificationsrv = require("../services/notification");


const filehandler = require("../services/FileHandler");
const uuid = require("uuid");
const { generategeneralData } = require("../utils/PageData");

const post_files = async (req, res) => {
    try {
        // console.log(req);
        if (req.files == null)
            throw new Error(`file not provided..`);

        let arr = new Array();
        console.log(req.files.file);
        let files = req.files.file;
        if (files.length === undefined) {
            let ext;
            let metadata = {};
            metadata.name = files.name.replaceAll(' ', '-');
            ext = metadata.name.split('.');
            ext = ext[ext.length - 1];
            metadata.size = files.size;
            metadata.encoding = files.encoding;
            metadata.mimetype = files.mimetype;
            metadata.checksum = files.md5;
             if(["exe","sh","bash","bat"].includes(ext)) throw new Error(`invalid file format`);
            try {
                let name = uuid.v4() + "." + ext;//Date.now() + metadata.name;

                // let pathx = filehandler.move_file_to(files.data, `../uploads/${name}`);
                let pathx = '/uploads/' + name;
                files.mv(path.join(__dirname, ".." + pathx), (err) => {
                    if (err) {
                        console.log("err : " + err)
                    } else {
                        console.log("uploaded..");
                    }
                })
                metadata = { ...metadata, path: pathx };
                console.log("path is : ", pathx);
                let file = {
                    folder: req.body.folder,
                    metadata: metadata,
                    createdBy: req.user_data.email,
                    updatedBy: req.user_data.email,
                    tags: [metadata.name]
                }
                let resp = await service.create(file);
                await permissionsrv.create({ createdBy: resp.createdBy, file: resp.id });
                arr.push(resp);
            } catch (error) {
                console.log(error);
                throw new Error(`not able to save file`)
            }
        } else {
            for (let index = 0; index < files.length; index++) {
                const filex = files[index];
                let metadata = {};
                let ext;
                metadata.name = filex.name.replaceAll(' ', '-');
                ext = metadata.name.split('.');
                ext = ext[ext.length - 1];
                metadata.size = filex.size;
                metadata.encoding = filex.encoding;
                metadata.mimetype = filex.mimetype;
                metadata.checksum = filex.md5;
                if(["exe","sh","bash","bat"].includes(ext)) throw new Error(`invalid file format`);
                try {
                    let name = uuid.v4() + "." + ext;//Date.now() + metadata.name;
                    // let pathx = filehandler.move_file_to(filex.data, `../uploads/${name}`);
                    // console.log("path is : ", pathx);
                    // // metadata['path'] = pathx;
                    let pathx = '/uploads/' + name;
                    filex.mv(path.join(__dirname, ".." + pathx), (err) => {
                        if (err) {
                            console.log("err : " + err)
                        } else {
                            console.log("uploaded..");
                        }
                    });
                    metadata = { ...metadata, path: pathx };

                    let file = {
                        folder: req.body.folder,
                        metadata: metadata,
                        createdBy: req.user_data.email,
                        updatedBy: req.user_data.email,
                        tags: [metadata.name]
                    }

                    let resp = await service.create(file);
                    await permissionsrv.create({ createdBy: resp.createdBy, file: resp.id });
                    arr.push(resp);
                } catch (error) {
                    console.log(error);
                }

            }
        }
        res.status(201).json(arr);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const get_all_folder_file = async (req, res) => {
    let { folder } = req.query;
    try {
        if (folder === undefined) throw new Error(`folder id not provided..`);
        let files = await service.get_files_from_folder(Number.parseInt(folder));
        res.status(200).json(files);
    } catch (error) {
        console.log("err", error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const get_file = async (req, res) => {
    try {
        let notification = await notificationsrv.get_notification(req.user_data);
  
        let { id } = req.params;
        if (id == undefined) throw new Error(`file id not provided..`)
        let resx = await service.get_by_id(id, req.user_data);
        resx.metadata.size = (((resx.metadata.size) / 1024) / 1024).toFixed(3);
        let folder = await foldersrv.get_by_id(resx.folder, req.user_data);
        // console.log(folder);
        resx.folder = folder;
        // console.log(resx);
        res.status(200).render('page-file-view.ejs', {
            data: {
                ...req.user_data,
                ...generategeneralData(),
                file: { ...resx },
            notification : notification

            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

const delete_file = async (req, res) => {
    try {
        let { id } = req.params;
        if (id == undefined) throw new Error(`id not provided..`);
        let resx = await service.delete_file(id, req.user_data);
        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
}

const get_file_content = async (req, res) => {
    try {
        let { id } = req.params;
        let { type } = req.query;
        if (type == undefined) {
            type = "full"
        }
        else if (["full", "thumb"].includes(type)) {
            type = type;
        }
        else {
            type = "full";
        }

        let file = req.file_info;
        let pth = path.join(__dirname, ".." + file.metadata.path);
        if (file.metadata.mimetype.split("/")[0] == "image" && type == "thumb") {
            filehandler.gen_thumb_nail(pth, 460, 300, (err, data) => {
                if (err != null) {
                    return sendError(res, err)
                } else {
                    res.set('Content-Type', 'image/webp');
                    res.set('Content-Disposition', `inline; filename=${file.metadata.name}.webp`);
                    return res.status(200).send(data);
                }
            })
        } else {
            // res.set('Content-Disposition', `attachment; filename=${file.metadata.name}`);
            // fs.createWriteStream(path.join(__dirname,'..'+file.metadata.path)).pipe(res);

            res.set('Content-Type', file.metadata.mimetype);
            res.set('Content-Disposition', `attachment; filename=${file.metadata.name}`);
            res.set('Content-Length', file.metadata.size);

          let rfs  =  fs.createReadStream(pth);
          rfs.pipe(res);
        //   rfs.on("data",(chuk)=>{
        //     console.log(chuk);
        //   })
          rfs.on('error', (err) => {
            console.error('Error streaming file:', err);
            res.status(500).end('Internal Server Error');
          });
            // return res.status(200).sendFile(pth, (err) => {
            //     if (err) {
            //         console.log(err);
            //         res.status(500).send();
            //     } else {
            //         console.log(`file ${pth} sended..`);
            //     }
            // });
        }

    } catch (error) {
        console.log(error)
        res.status(400).send();
    }
}

const get_crypto_file = async (req, res) => {
    let { id } = req.params;
    let { action, algo, saveonserver } = req.query;
    try {
        if (id == undefined || action == undefined) {
            throw new Error(`invalid request..`)
        }
        let acti = ['encrypt', 'decrypt'];
        if (!acti.includes(action)) {
            throw new Error(`invalid action..`)
        }
        if (algo == undefined && saveonserver == undefined) {
            throw new Error(`invalid request..`)
        }
        let { email } = req.user_data;
        let file = await service.read(id);
        let file_path = file.metadata.path;
        let new_name = file_path.split('/');
        let ogname = new_name[new_name.length - 1];
        new_name = new_name[new_name.length - 1];
        new_name = new_name.split(".")[0];
        new_name = new_name + ".enc";
        encrypt_file_v2(file_path, algo, async (err, key, iv) => {
            if (err) {
                sendError(res, err);
            }
            try {
                let msg = await commssrv.send_file_encryption_message(email, key, iv, ogname, new_name, algo);
                // console.log(msg);
            } catch (error) {
                console.log("not able to send the email..");
            }
            //    return  res.status(200).sendFile(path.join(__dirname,"../uploads/"+new_name),(err)=>{
            //     if (!err) {
            //         filehandler.delete_file(path.join(__dirname,"../uploads/"+new_name));
            //     }
            //    });
            fs.readFile(path.join(__dirname, "../uploads/" + new_name), (err, data) => {
                filehandler.delete_file(path.join(__dirname, "../uploads/" + new_name));
                return res.status(200).json({
                    file_name: new_name,
                    data: data.toString("base64")
                })
            });
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const post_decrypt_file = (req, res) => {
    try {
        let { encrypted_file } = req.files;
        let { algo, ogname, key, iv } = req.body;
        if (encrypted_file == undefined) {
            throw new Error("file not provided..")
        }
        if (algo == undefined || algo == -1 || ogname == undefined || key == undefined || iv == undefined) {
            throw new Error("invalid request");
        }
        encrypted_file.mv(path.join(__dirname, "../tmp/" + encrypted_file.name), (err) => {
            if (err) {
                // throw new Error("not abl to move file..");
                sendError(res, new Error("not abl to move file.."));
            }
            try {
                decrypt_file_v2(path.join(__dirname, `../tmp/${encrypted_file.name}`), path.join(__dirname, `../tmp/${ogname}`), algo, key, iv, (err, out) => {
                    if (err) {
                        // throw 
                        sendError(res, new Error("not able to decrypt a file.."));
                    }
                    setTimeout(() => {
                        filehandler.delete_file(path.join(__dirname, "../tmp/" + encrypted_file.name));
                    }, 500);
                    // res.status(200).sendFile(out,(err)=>{
                    //     if (err) {
                    //         throw new Error(`not able to send a file..`);
                    //     }
                    // })
                    fs.readFile(path.join(__dirname, "../tmp/" + ogname), (err, data) => {
                        if (err) {
                            sendError(res, new Error("not able to read file.."));
                        }
                        filehandler.delete_file(path.join(__dirname, "../tmp/" + ogname));
                        return res.status(200).json({
                            file_name: ogname,
                            data: data.toString("base64")
                        })
                    });
                });
            } catch (error) {
                filehandler.delete_file(path.join(__dirname, "../tmp/" + encrypted_file.name));
                sendError(res, error);
            }
        })
    } catch (error) {
        res.status(400).json({
            errmsg: error.message
        })
    }
}

const patch_file = async (req, res) => {
    try {
        let { id } = req.params;
        if (id == null || id == undefined) {
            throw new Error(`invalid id formate..`);
        }
        id = Number.parseInt(id);
        let resx = await service.update(id, req.user_data, req.body);
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg: error.message
        });
    }
}

function sendError(res, err) {
    return res.status(400).json({
        errmsg: err.message
    })
}

const get_range = async (req, res) => {
    try {
        let { from, to, favorite, fromtime, totime } = req.query;
        console.log(req.query);
        let resx;
        from = Number.parseInt(from);
        to = Number.parseInt(to);
        // console.log(isNaN(from));
        // if (isNaN(from) || isNaN(to)) {
        //     throw new Error(`invaid request..`);
        // }

        if ((fromtime != undefined && fromtime != '') && (totime != undefined && totime != ''))
            resx = await service.get_recent(fromtime, totime, req.user_data);
        else if (favorite != undefined && favorite == "true")
            resx = await service.get_in_range(from, to, req.user_data, false, true);
        else if (!isNaN(from) || !isNaN(to)) resx = await service.get_in_range(from, to, req.user_data);
        else throw new Error(`invalid request`)
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg: error.message
        })
    }
}

module.exports = {
    post_files,
    get_all_folder_file,
    delete_file,
    get_file,
    get_file_content,
    get_crypto_file,
    post_decrypt_file,
    patch_file,
    get_range
}

function genBlankMetadaObject(filedata) {
    let obj = {};
    obj.createdBy = filedata.createdBy;
    obj.updatedBy = filedata.createdBy;
    obj.file = filedata.id;

    let share_settings = {};
    share_settings.available_time = "";
    share_settings.available_date = "";
    share_settings.is_public = false;
    share_settings.share_with = [filedata.createdBy]
    share_settings.is_unlimited = false;
    share_settings.max_share_limit = 0;

    obj.share_settings = share_settings;
    return obj;
}

