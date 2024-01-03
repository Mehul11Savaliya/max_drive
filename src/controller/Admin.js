const { generategeneralData } = require("../utils/PageData");

const usersrv = require("../services/User");
const notificationsrv = require("../services/notification");

const user_list=async(req,res)=>{
    try {
        let notification = await notificationsrv.get_notification(req.user_data);
  
        let userlist = await usersrv.get_list(req.user_data.Auth.role,true);
        res.status(200).render("admin-user-list.ejs",{
            data:{
                ...generategeneralData(),
                ...req.user_data,
                list : userlist,
                notification : notification
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