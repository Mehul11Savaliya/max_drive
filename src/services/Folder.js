const model = require("../models/Folder");

const sync=async()=>{
    await model.sync({force:true});
    console.log(model.name,"synced..");
}

module.exports={sync}