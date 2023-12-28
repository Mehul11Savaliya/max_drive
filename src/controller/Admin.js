const { generategeneralData } = require("../utils/PageData");

const usersrv = require("../services/User");

const user_list=async(req,res)=>{
    try {
        let userlist = await usersrv.get_list(req.user_data.Auth.role,true);
        res.status(200).render("admin-user-list.ejs",{
            data:{
                ...generategeneralData(),
                ...req.user_data,
                list : userlist
            }
        })
    } catch (error) {
        return res.status(400).json({
            errmsg : error.message
        })
    }
}

module.exports={
    user_list
}