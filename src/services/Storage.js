const analyticssrv = require("../services/Analytics");
const get_stats=async()=>{
    const data = await analyticssrv.get_total_space_usage(null,true);
    return data;
}
module.exports={get_stats};