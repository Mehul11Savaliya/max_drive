const mastersrv = require("../services/Master");

const post_master=async(req,res)=>{
try {
    let {key,value,type}= req.body;
    if (key==undefined||value==undefined||type==undefined) {
        throw new Error(`invalid request..`);
    }
    let resx  = await mastersrv.create(req.body);
    return res.status(201).json(resx);
} catch (error) {
    res.status(400).json({
        errmsg : error.message
    })
}
}

const get_master_filter=async(req,res)=>{
    try {
        let {type,key,value,id}=req.query;
        let resx  = await mastersrv.filter(req.query);
        res.status(200).json(resx);
    } catch (error) {
         res.status(400).json({
        errmsg : error.message
    })
    }
}

module.exports={post_master,get_master_filter};