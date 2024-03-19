const path = require("path");
const patch_profile=(req,res)=>{
    try {
        console.log(req.files.pp,req.file);
        let pp = "/uploads/pp/default.gif";
        if (req.files!=null) {
            let pth  = "/uploads/pp/"+req.user_data.email+req.files.pp.name.split(".").pop();
            if (req.files.pp.size>=2097152) { //2mb
                    throw new Error(`large profile image`)                
            }
            req.files.pp.mv(path.join(__dirname,".."+pth),(err)=>{
                if (err) {
                    console.log("| ERROR |"," profile controller pp err",err);
                }
            });
        }
     
        
        console.log(req.body);
        res.status(200).json(req.body);
    } catch (error) {
        console.log("| ERROR |"," profile controller",error);
        res.status(400).json({
            errmsg:"error"
        })
    }
}

module.exports={patch_profile};