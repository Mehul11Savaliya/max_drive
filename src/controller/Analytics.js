const service = require("../services/Analytics");
const fileauditsrv = require("../services/FileAudit");

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

const get_storage_usage_stats=async(req,res)=>{
    try {
        let {gap}=req.query;
        if (!check_gap(gap)) throw new Error(`invlaid gap provided..`);
        
        let resx = await service.get_storage_stats(gap,req.user_data.email);
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        })        
    }
}

const get_file_search=async(req,res)=>{
    try {
        let {q} = req.query;
        if (q==undefined) {
            throw new Error();
        }
        if (q=='') {
            return res.status(200).json([]);
        }
        let resx  = await service.search(q,req.user_data.email);
        res.status(200).json(resx);
    } catch (error) {
        console.log(error);
        res.status(200).send();
    }
}

const get_file_audit=async(req,res)=>{
    try {
        let {id} = req.params;
        if (id==undefined) {
            throw new Error(`invalid request..`);
        }
        id = Number.parseInt(id);
        let resx  = await fileauditsrv.get_file_timeline(id);
        resx = resx.map((val)=>{
            return {
                user : val.user,
                time : val.time,
                fileid : val.fileid,
                message : val.message
            }
        })
        res.status(200).json(resx);
    } catch (error) {
        res.status(400).json({
            errmsg : error.message
        })
    }
}

const get_upsanddown=async(req,res)=>{
    try {
        let resx = await service.uploads_and_downloads(req.user_data);
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
    get_storage_usage,
    get_storage_usage_stats,
    get_file_search,
    get_file_audit,
    get_upsanddown
}

function check_gap(gap) {
    if (gap==undefined||gap==null||gap=='') {
        return false;
    }
    let allowed = ['daily','monthly','weekly','yearly'];
    if (allowed.includes(gap)) {
        return true;
    }
}