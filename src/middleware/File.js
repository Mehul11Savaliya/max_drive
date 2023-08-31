const  filesrv  = require("../services/File");

const extract_file=async(req,res,next)=>{
    try {
        let {id} = req.params;
        let resx = await filesrv.read(id);
        req.file_info = resx;
        next(); 
    } catch (error) {
        res.status(404).send();
    }
}

module.exports={extract_file};