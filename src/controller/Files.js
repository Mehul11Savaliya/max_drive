const path = require("path");
const fs = require("fs");

const service = require("../services/File")
const foldersrv = require("../services/Folder")
const { encrypt_file_v2, decrypt_file_v2 } = require("../services/FileHandler");
const commssrv = require("../services/Communication");

const filehandler = require("../services/FileHandler");
const uuid = require("uuid");
const { generategeneralData } = require("../utils/PageData");

const post_files = async (req, res) => {
    try {
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

            try {
                let name = uuid.v4() + "." + ext;//Date.now() + metadata.name;
                let pathx = filehandler.move_file_to(files.data, `../uploads/${name}`);
                metadata = { ...metadata, path: pathx };
                console.log("path is : ", pathx);
                let file = {
                    folder: req.body.folder,
                    metadata: metadata,
                    createdBy: req.user_data.email,
                    updatedBy: req.user_data.email,

                }
                let resp = await service.create(file);
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
                try {
                    let name = uuid.v4() + "." + ext;//Date.now() + metadata.name;
                    let pathx = filehandler.move_file_to(filex.data, `../uploads/${name}`);
                    console.log("path is : ", pathx);
                    // metadata['path'] = pathx;
                    metadata = { ...metadata, path: pathx };

                    let file = {
                        folder: req.body.folder,
                        metadata: metadata,
                        createdBy: req.user_data.email,
                        updatedBy: req.user_data.email,
                    }

                    let resp = await service.create(file);
                    arr.push(resp);
                } catch (error) {
                    console.log(error);
                }

            }
        }
        console.log(arr);
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
        console.log(error);
        res.status(400).json({
            errmsg: error.message
        });
    }
}

const get_file = async (req, res) => {
    try {
        let { id } = req.params;
        if (id == undefined) throw new Error(`file id not provided..`)
        let resx = await service.get_by_id(id, req.user_data);
        resx.metadata.size = (((resx.metadata.size) / 1024) / 1024).toFixed(3);
        let folder = await foldersrv.get_by_id(resx.folder);
        resx.folder = folder;
        console.log(resx);
        res.status(200).render('page-file-view.ejs', {
            data: {
                ...req.user_data,
                ...generategeneralData(),
                file: { ...resx }

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
    // try {
    let { id } = req.params;
    let file = await service.read(id);
    let share_settings = file.file_metadata.share_settings;
    //     if ((share_settings.is_public||share_settings.share_with.length>0||!share_settings.share_with.includes(""))&&share_settings.max_share_limit>0) {
    //     res.status(200).json(file);   
    //     }else{
    //         res.status(401).send();
    //     }
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send();
    // }
    if (share_settings.is_public && share_settings.is_unlimited) {
        // res.status(200).send("u hab access unlimited times..");
        let pth = path.join(__dirname, ".." + file.metadata.path);
        res.status(200).sendFile(pth, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            } else {
                console.log(`file ${pth} sended..`);
            }
        });
    }
    else if (share_settings.is_public && !share_settings.is_unlimited) {
        //   res.status(200).send("u hab access but remaining chacnce : "+share_settings.max_share_limit);
        // res.status(200).render('page-share-view.ejs',);
        // res.status(200).json(file)
        let pth = path.join(__dirname, ".." + file.metadata.path);
        res.status(200).sendFile(pth, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            } else {
                console.log(`file ${pth} sended..`);
            }
        });
    }
    else if (!share_settings.is_public && !share_settings.is_unlimited) {
        try {
            //extracting token from cookie
            let jwt = JSON.parse(req.cookies.jwt);
            console.log(jwt);
            if (jwt === undefined || jwt === null)
                throw new Error(`try to login again..`)
            let access_token = jwt.access;
            let refresh_token = jwt.refresh;

            //checking the token..
            let data = tokensrv.checkAccessToken(access_token);
            let tokendata = data;

            let user = await usersrv.getUserByEmail(tokendata.email);
            let { email } = user;
            // console.log(share_settings.share_with,typeof share_settings.share_with);
            if (share_settings.share_with.includes(email)) {
                // res.status(200).send("u hab access");
                // res.status(200).json(file)
                let pth = path.join(__dirname, ".." + file.metadata.path);
                res.status(200).sendFile(pth, (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send();
                    } else {
                        console.log(`file ${pth} sended..`);
                    }
                });
            } else {
                // res.status(200).send("u dont hab access");
                res.status(401).send();
            }

        } catch (error) {
            res.status(401).send();
        }
    } else {
        res.status(401).send();
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

function sendError(res, err) {
    return res.status(400).json({
        errmsg: err.message
    })
}

module.exports = {
    post_files,
    get_all_folder_file,
    delete_file,
    get_file,
    get_file_content,
    get_crypto_file,
    post_decrypt_file
}