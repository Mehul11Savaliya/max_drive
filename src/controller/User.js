const { generategeneralData } = require("../utils/PageData");

const get_user_home = (req,res)=>{
    res.status(200).render('index.ejs',{data:{
        ...generategeneralData(),
        ...req.user_data
    }});
}

module.exports={get_user_home}