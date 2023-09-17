const service = require("../services/Analytics");

const under_dev=(req,res)=>{
    res.status(503).send();
}

const get_file_list=async(req,res)=>{
    try {
        let {from,limit}=req.query;
        let {email}=req.user_data;
        from = Number.parseInt(from);
        limit = Number.parseInt(limit);
        if (isNaN(from)) {
            from = 0;
        }
        if (isNaN(limit)) {
            limit = 10;
        }
       
        let resx  = await service.get_files(email,from,limit,false);
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        });
    }
}

const get_index_docs_list=async(req,res)=>{
    try {
        let {from,limit}=req.query;
        let {email}=req.user_data;
        from = Number.parseInt(from);
        limit = Number.parseInt(limit);
        if (isNaN(from)) {
            from = 0;
        }
        if (isNaN(limit)) {
            limit = 10;
        }
        let resx  = await service.get_index_documents(email,from,limit,false);
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        });
    }
}

const get_storage_usage=async(req,res)=>{
    try {
    let {email}=req.user_data;   
    let resx = await service.get_total_space_usage(email);
    res.status(200).json(resx);
    } catch (error) {
     res.status(400).json({
        errmsg : error.message
     })   
    }
}

module.exports={
    under_dev,
    get_file_list,
    get_index_docs_list,
    get_storage_usage
}