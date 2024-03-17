const isVarified=(req,res,next)=>{
    try {
        let {user_data}=req;
        if (user_data==undefined) {
           return render_error_page(res,{
                status:401,
                title:"Needs to login",
                subtitle:"Kindly login",
                next:"/signin"
            });
        }
        if (user_data.Auth.varified==false) {
            return render_error_page(res,{
                status:401,
                title:"Needs to varify",
                subtitle:"varification required!",
                next:`/auth/${user_data.Auth.id}/screen/varifyotp`
            });
        }
        console.log("going next")
      return  next();
    } catch (error) {
        console.log("lol",error);
     return   res.status(500).send();
    }
    
}

const render_error_page=(res,data)=>{
     return   res.status(data.status).render("pages-error.ejs",{
            data:{
                ...data
            }
        })
}

module.exports={isVarified}