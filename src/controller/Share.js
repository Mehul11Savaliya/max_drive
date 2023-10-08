const filesrv = require("../services/File");
const tokensrv = require('../services/Token');
const usersrv = require("../services/User");
const { generategeneralData } = require("../utils/PageData");

const couchsrv = require("../services/couchdb");

var emmiterx = require("../subscriber/ShareEvents");
var filevents = require("../subscriber/FileEvents");

const get_file = async (req, res) => {
    let user;
    try {
        //extracting token from cookie
        let jwt = JSON.parse(req.cookies.jwt);
        if (jwt === undefined || jwt === null)
            throw new Error(`try to login again..`)
        let access_token = jwt.access;
        let refresh_token = jwt.refresh;

        //checking the token..
        let data = tokensrv.checkAccessToken(access_token);
        let tokendata = data;

        let ress = await usersrv.getUserByEmail(tokendata.email);
        user = ress;
    } catch (error) {
        user = null;
    }

    try {
        // let {id} = req.params;
        // if(id==undefined) res.status(400).send('🖕');
        // const resx  = await filesrv.get_by_id(id,{email:"svlmehul@gmail.com"});
        let file = req.file_info;
        filevents.emit("download",{id:file.id,downloads:Number.parseInt(file.downloads)+1});
        let { share_settings } = file.file_metadata;
        if (share_settings.is_public && share_settings.is_unlimited) {
            // res.status(200).send("u hab access unlimited times..");
            let filepath = file.metadata.path.split('/');
            emmiterx.emit("share",{
                fileid : file.id,
                filename: file.metadata.name,
                servername: filepath[filepath.length - 1],
                user: "unauthorized_user",
                time: Date.now()
            });
         return res.status(200).render('page-share-view.ejs', {
                data: {
                    ...generategeneralData(),
                    file: { ...file },
                    user :{email:(user == null) ? undefined : user.email}
                }
            });
        }
        else if (share_settings.is_public && !share_settings.is_unlimited) {
            //   res.status(200).send("u hab access but remaining chacnce : "+share_settings.max_share_limit);
            // res.status(200).render('page-share-view.ejs',);
            let filepath = file.metadata.path.split('/');
            emmiterx.emit("share",{
                fileid : file.id,
                filename: file.metadata.name,
                servername: filepath[filepath.length - 1],
                user: (user == null) ? "anonymous" : user.email,
                time: Date.now()
            });
          return  res.status(200).render('page-share-view.ejs', {
                data: {
                    ...generategeneralData(),
                    file: { ...file },
                    user :{email:(user == null) ? undefined : user.email}
                }
            });
        }
        else if (!share_settings.is_public && !share_settings.is_unlimited) {
            try {
                  if (user == null) {
                    // res.status(200).send("u dont hab access");
                    let filepath = file.metadata.path.split('/');
                    emmiterx.emit("share",{
                        fileid : file.id,
                        filename: file.metadata.name,
                        servername: filepath[filepath.length - 1],
                        user: "unauthorized_user",
                        time: Date.now()
                    });
                    return res.status(401).send();
                }

                let { email } = user;
                if (file.createdBy == email||share_settings.share_with.includes(email)) {
                    // res.status(200).send("u hab access");
                    let filepath = file.metadata.path.split('/');
                    emmiterx.emit("share",{
                        fileid : file.id,
                        filename: file.metadata.name,
                        servername: filepath[filepath.length - 1],
                        user: email,
                        time: Date.now()
                    });
                    res.status(200).render('page-share-view.ejs', {
                        data: {
                            ...user,
                            ...generategeneralData(),
                            file: { ...file },
                            user :{email:user.email}
                        }
                    });
                } else {
                    // res.status(200).send("u dont hab access");
                    let filepath = file.metadata.path.split('/');
                    emmiterx.emit("share",{
                        fileid : file.id,
                        filename: file.metadata.name,
                        servername: filepath[filepath.length - 1],
                        user: "unauthorized_user(" + user.email+")",
                        time: Date.now()
                    });
                    return res.status(401).send();
                }

            } catch (error) {
                console.log(error);
                res.status(401).send();
            }
        } else {
            res.status(200).send("u dont hab access");
        }
    } catch (error) {
        res.status(401).send("u dont hab access☠🐦");
    }
}

const get_live_share_page=(req,res)=>{
    res.status(200).render("page-live-share.ejs",{
        data:{
            ...generategeneralData(),
            ...req.user_data,
            ...generategeneralData()
        }
    })
}

const get_folder=(req,res)=>{
    res.status(200).render('page-folder-share.ejs',{
        data:{
            ...generategeneralData(),
            folder:req.folder_info,
            user:req.user_data
        }
    });
}

module.exports = { get_file,get_live_share_page,get_folder ,emmiterx:emmiterx}