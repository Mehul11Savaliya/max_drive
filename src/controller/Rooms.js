const {generategeneralData}=require("../utils/PageData");
const service = require("../services/Rooms");
const uuid = require("uuid")
const path = require("path");
const filehandler = require("../services/FileHandler");

const get_page=(req,res)=>{
    res.status(200).render("page-rooms.ejs",{data:{
        ...generategeneralData(),
        ...req.user_data
    }});
}

const get_room=async(req,res)=>{
    try {
        let resx = null;
        let {all}=req.query;
        if (all==undefined) {
            throw new Error(`invald request`);
        }
        if (all=="true") {
            resx = await service.read_room(null,req.user_data,false,true,true);
        }else{
            resx = await service.read_room(null,req.user_data,false,false,true);
        }
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        })
    }
}

const create_room=async(req,res)=>{
try {
    let resx  = null;
    let {name,description}=req.body;
    if (name==undefined||name==""||description==undefined||description=="") {
        throw new Error(`name and description not provided..`)
    }
    let data = {thumbnail:"/assets/images/default_room_thumb.png",users:0};
    if (req.files!=null&&req.files.thumb!=undefined) {
        let {thumb} = req.files;
        if (thumb.mimetype.split("/")[0]!="image")
        throw new Error(`invalid image type`);
        if (thumb.size>20480) {
            throw new Error("image size is valid upto 20kb");
        }
        let name  = uuid.v4()+"."+thumb.name.split(".").pop();
        data.thumbnail = "/uploads/roomst/"+name;
        resx= await service.create({...req.body,data},req.user_data)//,req.user_data);
        try {
            thumb.mv(path.join(__dirname,".."+data.thumbnail),(err)=>{
                if (err) {
                    console.log("not able to upload thumbnail");
                }else{
                    console.log("thumbnail uploaded : "+data.thumbnail);
                }
            })
        } catch (error) {console.log("err in room thumbnail upload : "+error.message)}
      
    }
    res.status(201).json(resx);
} catch (error) {
    res.status(400).json({
        errmsg:error.message
    })
}
}

const delete_room=async(req,res)=>{
    try {
        let {id} = req.params;
        if (id==undefined) {
            throw new Error(`id not provided..`);
        }
        await service.delete_by_id(id,req.user_data)//,req.user_data);
        res.status(204).send();   
    } catch (error) {
        console.log(error);
        res.status(400).json({
            errmsg : error.message
        })
    }
}

const get_room_view=async(req,res)=>{
    try {
        let {id} = req.params;
        id = Number.parseInt(id)
        if (isNaN(id)) {
            throw new Error(`room not available`);
        }
        let roomdata  = await service.read_room(id,req.user_data,true,false,true);
        res.status(200).render("page-room-view.ejs",{data:{ 
            ...generategeneralData(),
            ...req.user_data,
            room : roomdata}});
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        })
    }
}

module.exports={get_page,create_room,delete_room,get_room,get_room_view};