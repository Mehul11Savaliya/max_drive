const { generategeneralData } = require("../utils/PageData");

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

        default:
            res.status(404).render('pages-error.ejs', {
                data: {

                }
            })
            break;
    }
}

const get_folder_pages=(req,res)=>{
    res.status(200).render('page-folder-view.ejs', {
        data: {
            ...generategeneralData(),
            ...req.user_data
        }
    });
}

module.exports = { get_user_home, get_pages ,get_folder_pages}