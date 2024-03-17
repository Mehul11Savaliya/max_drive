const {generategeneralData}=require("../utils/PageData")
const  service  = require("../services/Explore");
const notificationsrv = require("../services/notification");

const get_page=async(req,res)=>{
    let notification = await notificationsrv.get_notification(req.user_data);
  
    res.status(200).render("page-explore.ejs",{data:{
        ...generategeneralData(),
        ...req.user_data,
        notification : notification
    }});
}

const get_public_files=async(req,res)=>{
    try {
    let {from,limit}=req.query;
    let resx = null;
    if (from==undefined) {
        throw new Error(`invalid request..`)
    }
    if (limit=="undefined") {
        resx  = await service.get_public_files(Number.parseInt(from));
    }
    else{
        resx = await service.get_public_files(Number.parseInt(from),Number.parseInt(limit));
    }
    res.status(200).json(resx);
} catch (error) {
    console.log(error);
    res.status(400).json({
        errmsg  : error.message
    })       
}
}

const post_comments=async(req,res)=>{
    try {
        let {comment} = req.body;
        let {id}=req.params;
       let fileid = Number.parseInt(id);
        if (comment==undefined||comment==""||isNaN(fileid)) {
           throw new Error(`invalid comment`);
        }
        let resx = await service.add_comment(fileid,req.user_data,{
            text:comment,
            fileid : fileid
        });
        return res.status(201).send(resx);
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        })
    }
}

const get_comments=async(req,res)=>{
    try {
        let {id}=req.params;
       let fileid = Number.parseInt(id);
        if (isNaN(fileid)) {
           throw new Error(`invalid id`);
        }
        let resx = await service.get_comments(fileid);
        return res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        })
    }
}

module.exports={
    get_page,
    get_public_files,
    post_comments,
    get_comments
}