const { generategeneralData } = require("../utils/PageData");

const usersrv = require("../services/User");
const notificationsrv = require("../services/notification");
const auditsrv = require("../services/Audit");
const pagehitsutl = require("../utils/pagehits");
const storagesrv = require("../services/Storage");

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

const analytics_page=async(req,res)=>{
    try {
        let notification = await notificationsrv.get_notification(req.user_data);
        let audit_data = await auditsrv.get_page_by_user();
        let pagehits =  pagehitsutl.catagprized_pagehits(audit_data);
        let storagestats = await storagesrv.get_stats();
        let jsn={};
        pagehits.forEach((val,key)=>{
            jsn[key]=val;
        });        
        res.status(200).render("admin-analytics-page.ejs",{
            data:{
                ...generategeneralData(),
                ...req.user_data,
                notification : notification,
                page_hits : jsn,
                storage_stats:storagestats
            }
        })
    } catch (error) {
        return res.status(400).json({
            errmsg : error.message
        })
    }
}

const bugs_list=async(req,res)=>{
    try {
        let notification = await notificationsrv.get_notification(req.user_data);
        res.status(200).render("admin-bugs.ejs",{
            data:{
                ...generategeneralData(),
                ...req.user_data,
                notification : notification,
            }
        })
    } catch (error) {
        return res.status(400).json({
            errmsg : error.message
        })
    }
}

module.exports={
    user_list,
    analytics_page,
    bugs_list
}