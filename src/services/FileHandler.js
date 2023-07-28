const fs  = require("fs");
const path = require("path");

const move_file_to=(buffer,pathx)=>{
    let dest  = path.join(__dirname,pathx);
    fs.writeFile(dest,buffer,(err)=>{
        if(err) throw new Error(`not able to save a file`);
    });
    return pathx.substring(2);
}

module.exports={
    move_file_to
}