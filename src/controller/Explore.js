const {generategeneralData}=require("../utils/PageData")
const  service  = require("../services/Explore");

const get_page=(req,res)=>{
    res.status(200).render("page-explore.ejs",{data:{
        ...generategeneralData(),
        ...req.user_data
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
module.exports={
    get_page,
    get_public_files
}