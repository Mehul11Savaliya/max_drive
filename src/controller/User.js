const { generategeneralData } = require("../utils/PageData");

const foldersrv = require("../services/Folder");
const notificationsrv = require("../services/notification");

const get_user_home = async(req, res) => {
    let notification = await notificationsrv.get_notification(req.user_data);
    res.status(200).render('index.ejs', {
        data: {
            ...generategeneralData(),
            ...req.user_data,
            notification : notification
        }
    });
}

const get_pages = async(req, res) => {
    let notification = await notificationsrv.get_notification(req.user_data);

    switch (req.params.page) {
        case '':
            res.status(200).render('index.ejs', {
                data: {
                    ...generategeneralData(),
                    ...req.user_data,
            notification : notification
                }
            });
            break;
        case 'edit':
            res.status(200).render('page-userprofile-edit.ejs', {
                data: {
                    ...generategeneralData(),
                    ...req.user_data,
                    notification : notification
                }
            });
            break;

        case 'files':
            res.status(200).render('page-files-view.ejs', {
                data: {
                    ...generategeneralData(),
                    ...req.user_data,
                    notification : notification
                }
            })
            break;
        case 'favorite':
            res.status(200).render('page-favorites-view.ejs', {
                data: {
                    ...generategeneralData(),
                    ...req.user_data,
                    notification : notification
                }
            })
            break;

            case 'recent':
                res.status(200).render('page-recent-view.ejs', {
                    data: {
                        ...generategeneralData(),
                        ...req.user_data,
                        notification : notification
                    }
                })
                break;

        default:
            res.status(404).render('pages-error.ejs', {
                data: {

                }
            })
            break;
    }
}

const get_folder_pages = async (req, res) => {
    try {
        let notification = await notificationsrv.get_notification(req.user_data);
  
        let { id } = req.params;
        if (id == undefined) {
            throw new Error(`id not provided..`);
        }
        let data = await foldersrv.get_by_id(id, req.user_data);
        res.status(200).render('page-folder-view.ejs', {
            data: {
                ...generategeneralData(),
                ...req.user_data,
                folder: data,
                notification : notification
            }
        });
    } catch (error) {
        res.status(400).json({
            errmsg: error.message
        })
    }
}

module.exports = { get_user_home, get_pages, get_folder_pages }