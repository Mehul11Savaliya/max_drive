const filesrv = require("../services/File");
const tokensrv = require('../services/Token');
const usersrv = require("../services/User");
const { generategeneralData } = require("../utils/PageData");

const couchsrv = require("../services/couchdb");

const get_file = async (req, res) => {
    let user;
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
        let { share_settings } = file.file_metadata;
        if (share_settings.is_public && share_settings.is_unlimited) {
            // res.status(200).send("u hab access unlimited times..");
            let filepath = file.metadata.path.split('/');
            couchsrv.insertFileTimeline(file.id, {
                filename: file.metadata.name,
                servername: filepath[filepath.length - 1],
                user: "unauthorized_user",
                time: Date.now()
            });
            res.status(200).render('page-share-view.ejs', {
                data: {
                    ...generategeneralData(),
                    file: { ...file }

                }
            });
        }
        else if (share_settings.is_public && !share_settings.is_unlimited) {
            //   res.status(200).send("u hab access but remaining chacnce : "+share_settings.max_share_limit);
            // res.status(200).render('page-share-view.ejs',);
            let filepath = file.metadata.path.split('/');
            couchsrv.insertFileTimeline(file.id, {
                filename: file.metadata.name,
                servername: filepath[filepath.length - 1],
                user: (user == null) ? "anonymous" : user.email,
                time: Date.now()
            });
            res.status(200).render('page-share-view.ejs', {
                data: {
                    ...generategeneralData(),
                    file: { ...file }

                }
            });
        }
        else if (!share_settings.is_public && !share_settings.is_unlimited) {
            try {
                // //extracting token from cookie
                // let jwt = JSON.parse(req.cookies.jwt);
                // console.log(jwt);
                // if (jwt === undefined || jwt === null)
                //     throw new Error(`try to login again..`)
                // let access_token = jwt.access;
                // let refresh_token = jwt.refresh;

                // //checking the token..
                // let data = tokensrv.checkAccessToken(access_token);
                // let tokendata = data;

                // let user = await usersrv.getUserByEmail(tokendata.email);

                // console.log(share_settings.share_with,typeof share_settings.share_with);




                if (user == null) {
                    // res.status(200).send("u dont hab access");
                    let filepath = file.metadata.path.split('/');
                    couchsrv.insertFileTimeline(file.id, {
                        filename: file.metadata.name,
                        servername: filepath[filepath.length - 1],
                        user: "unauthorized_user",
                        time: Date.now()
                    });
                    return res.status(401).send();
                }

                let { email } = user;
                if (share_settings.share_with.includes(email)) {
                    // res.status(200).send("u hab access");
                    // res.status(200).render('page-share-view.ejs', {});

                    let filepath = file.metadata.path.split('/');
                    couchsrv.insertFileTimeline(file.id, {
                        filename: file.metadata.name,
                        servername: filepath[filepath.length - 1],
                        user: email,
                        time: Date.now()
                    });
                    res.status(200).render('page-share-view.ejs', {
                        data: {
                            ...user,
                            ...generategeneralData(),
                            file: { ...file }

                        }
                    });
                } else {
                    // res.status(200).send("u dont hab access");
                    let filepath = file.metadata.path.split('/');
                    couchsrv.insertFileTimeline(file.id, {
                        filename: file.metadata.name,
                        servername: filepath[filepath.length - 1],
                        user: "unauthorized_user" + user.email,
                        time: Date.now()
                    });
                    return res.status(401).send();
                }

            } catch (error) {
                console.log(error);
                res.status(401).send();
                // res.status(400).send(error.message);
                // res.status(400).render('pages-error.ejs', {
                //     data: {
                //         errmsg: error.message
                //     }
                // });
            }
        } else {
            res.status(200).send("u dont hab access");
        }
        // res.status(200).json(req.file_info);
    } catch (error) {
        console.log(error);
        // let filepath = file.metadata.path.split('/');
        //     couchsrv.insertFileTimeline(file.id,{
        //             filename : file.metadata.name,
        //             servername : filepath[filepath.length-1],
        //             user :"unauthorized_user",
        //             time : Date.now()
        //     });
        res.status(401).send("u dont hab access☠🐦");
    }
}

const get_live_share_page=(req,res)=>{
    res.status(200).render("page-live-share.ejs",{
        data:{
            ...req.user_data,
            ...generategeneralData()
        }
    })
}

module.exports = { get_file,get_live_share_page }