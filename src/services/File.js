const model = require("../models/File");

const sync=async()=>{
    await model.sync({force:true});
    console.log("file model synced..");
}

module.exports={sync}