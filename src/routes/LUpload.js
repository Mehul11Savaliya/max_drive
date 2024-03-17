const express = require("express");
const router = express.Router();
const notificationsrv = require("../services/notification");
const tokenmdwr = require("../middleware/Token");
const usermdwr  = require("../middleware/User");
const { generategeneralData } = require("../utils/PageData");

const Busboy = require('busboy');
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");

var db = require("../config/nedb");

const fileservice = require("../services/File")
const permissionsrv = require("../services/Permission");

router.use(tokenmdwr.extractTokenFromCookie,tokenmdwr.checkAccessToken,usermdwr.getUserFromTokeData);

router.get("/",async(req,res)=>{
    let notification = await notificationsrv.get_notification(req.user_data);
    res.status(200).render("page-large-upload.ejs",{
        data: {
            ...req.user_data,
            ...generategeneralData(),
        notification : notification

    }});
})

router.post("/", async (req, res) => {
    try {
        let { lastModified, name, size, type ,folder} = req.body;
        if (name==undefined||isNaN(Number.parseInt(size))) {
            throw new Error(`invalid request`);
        }
        let ext = name.split(".").pop();
        if(["exe","sh","bash","bat"].includes(ext)) throw new Error("invalid file format");
        let ps = `/uploads/${uuid.v4()}.${ext}`;
        fs.openSync(path.join(__dirname, ".." + ps), 'w');
        const insertPromise = new Promise((resolve, reject) => {
            db.insert({ idx: Date.now(),folder:folder, name : name, path: ps, total: size,mimetype:type,uploaded:false }, (err, indoc) => {
                if (err) {
                    console.log("err", err);
                    reject(err);
                }
                resolve(indoc);
            });
        });

        let resx = await insertPromise;
        return sendRes(res, resx, 201);
    } catch (error) {
        console.log(error.message);
        res.status(400).json({
            errmsg: "invalid request"
        });
    }
})

router.patch("/:id", (req, res) => {
    try {
        let { id } = req.params;
        id = Number.parseInt(id);
        if (isNaN(id)) {
            throw new Error(`invaild resumable file id ${id}`);
        }
        const busboy = Busboy({ headers: req.headers });
        db.findOne({ idx: id,uploaded:false }, (err, doc) => {
            if (!doc || err) {
                return res.status(404).send();
            }
            let pathx = doc.path;
            let writestream = fs.createWriteStream(path.join(__dirname, ".." + pathx), { flags: 'a'});

            busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
                file.on("end",async () => {
                    db.remove({ idx: doc.idx }, {}, (err, n) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("deleted : ", n)
                        }
                    });
                    console.log("uploaded...",fieldname,file,filename,encoding,mimetype,doc);

                    let ext = doc.name.split(".").pop();
                    let metadata = {};
                    metadata.name = doc.name.replaceAll(' ', '-');
                    metadata.size = doc.total;
                    metadata.encoding = doc.encoding || filename.encoding;
                    metadata.mimetype = doc.mimetype||filename.mimeType;
                    metadata.checksum = "MSX85";
                     if(["exe","sh","bash","bat"].includes(ext)){
                        return res.status(400).json({
                            errmsg : "invalid file format"
                        });
                     } //throw new Error(`invalid file format`);
                    try {
                        let name = doc.name;
                        let pathx = doc.path;
                        metadata = { ...metadata, path: pathx };
                        console.log("path is : ", pathx);
                        let file = {
                            folder: doc.folder,//req.body.folder,
                            metadata: metadata,
                            createdBy: req.user_data.email,
                            updatedBy: req.user_data.email,
                            tags: [metadata.name]
                        }
                        let resp = await fileservice.create(file);
                        await permissionsrv.create({ createdBy: resp.createdBy, file: resp.id });
                      return res.status(200).json(resp);
                    } catch (error) {
                        console.log(error);
                        fs.unlink(path.join(__dirname,".."+doc.path),(err)=>{
                            if (err) {
                                console.log("not able to delete a file",doc.path)
                            }else{
                                console.log("deleted a file",doc.path)
                            }
                        })
                        // throw new Error(`not able to save file`)
                        return res.status(500).json({
                            errmsg : "not able to save file"
                        });
                    }

                    res.status(200).json(doc);
                });
                file.on("data", (chk) => {
                    // console.log(chk.length);
                })
                file.on("error", (e) => { console.log("err", e) })
                file.pipe(writestream);
            });
            req.pipe(busboy);
        })
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            errmsg: "invalid request"
        });
    }
});

router.head("/:id", (req, res) => {
    try {
        let { id } = req.params;
        id = Number.parseInt(id)
        if (isNaN(id)) {
            throw new Error(`invaild resumable file id ${id}`);
        }
        // let res  = await fs.stat(path.join(__dirname,"))
        db.findOne({ idx: id }, (err, doc) => {
            if (!doc || err) {
                console.log(doc, err)
                return res.status(404).send();
            }
            fs.stat(path.join(__dirname, ".." + doc.path), (err, stat) => {
              console.log(stat.size);
                let curre = stat.size;
                res.setHeader("id", doc.idx);
                res.setHeader("current", curre);
                res.setHeader("total", doc.total);
                return res.status(200).send();
            });
        })
    } catch (error) {
        console.log(error.message);
        res.status(400).json({
            errmsg: "invalid request"
        });
    }
});

router.delete("/:id", (req, res) => {
    try {
        let { id } = req.params;
        id = Number.parseInt(id)
        if (isNaN(id)) {
            throw new Error(`invaild file id ${id}`);
        }
        db.findOne({ idx: id }, (err, doc) => {
            if (!doc || err) {
                return res.status(404).send();
            }
            let pathx = doc.path;
            try {
                db.remove({ idx: id }, (err, num) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("🐦");
                    } else {
                        fs.unlink(path.join(__dirname, ".." + pathx), (err) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send("🐦");
                            }
                            else {
                                console.log(`count:${num}  deleted `, pathx);
                                return res.status(204).send();
                            }
                        })
                    }
                })

            } catch (error) {
                console.log(err);
                return res.status(500).send("🐦");
            }
        })
    } catch (error) {
        console.log(error.message);
        res.status(400).json({
            errmsg: "invalid request"
        });
    }
});

function sendRes(res, messagejson, status) {
    return res.status(status).json(messagejson);
}

module.exports=router;