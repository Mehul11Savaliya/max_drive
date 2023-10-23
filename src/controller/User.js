const { generategeneralData } = require("../utils/PageData");

const foldersrv = require("../services/Folder");

const get_user_home = (req, res) => {
    res.status(200).render('index.ejs', {
        data: {
            ...generategeneralData(),
            ...req.user_data
        }
    });
}

const get_pages = (req, res) => {
    switch (req.params.page) {
        case '':
            res.status(200).render('index.ejs', {
                data: {
                    ...generategeneralData(),
                    ...req.user_data
                }
            });
            break;
        case 'edit':
            res.status(200).render('page-userprofile-edit.ejs', {
                data: {
                    ...generategeneralData(),
                    ...req.user_data
                }
            });
            break;

        case 'files':
            res.status(200).render('page-files-view.ejs', {
                data: {
                    ...generategeneralData(),
                    ...req.user_data
                }
            })
            break;
        case 'favorite':
            res.status(200).render('page-favorites-view.ejs', {
                data: {
                    ...generategeneralData(),
                    ...req.user_data
                }
            })
            break;

            case 'recent':
                res.status(200).render('page-recent-view.ejs', {
                    data: {
                        ...generategeneralData(),
                        ...req.user_data
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
        let { id } = req.params;
        if (id == undefined) {
            throw new Error(`id not provided..`);
        }
        let data = await foldersrv.get_by_id(id, req.user_data);
        res.status(200).render('page-folder-view.ejs', {
            data: {
                ...generategeneralData(),
                ...req.user_data,
                folder: data
            }
        });
    } catch (error) {
        res.status(400).json({
            errmsg: error.message
        })
    }
}

module.exports = { get_user_home, get_pages, get_folder_pages }