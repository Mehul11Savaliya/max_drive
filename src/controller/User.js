const get_user_home = (req,res)=>{
    res.status(200).render('index.ejs',{data:{}});
}

module.exports={get_user_home}