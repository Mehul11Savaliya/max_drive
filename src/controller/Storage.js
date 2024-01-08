const service = require("../services/Storage");

const get_storage=async(req,res)=>{
  try {
    const data = await service.get_stats();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
        errmsg : error.message
    })
  }
}

module.exports={get_storage};