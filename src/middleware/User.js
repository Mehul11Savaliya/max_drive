let service = require('../services/User');

const getUserFromTokeData =async(req,res,next)=>{
    try {
        let tokendata  = req.data;
        let user  = await service.getUserByEmail(tokendata.email);
        req.user_data  = user;
        next();
    } catch (error) {
        console.log(error);
        res.render('pages-error.ejs',{
            data :{
                errmsg : error.message
            }
        });
    }
}

module.exports={
    getUserFromTokeData
}