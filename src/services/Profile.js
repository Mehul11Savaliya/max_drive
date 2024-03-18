let model  = require("../models/Profile");

const sync=async(type)=>{
    try {
      let res =   await model.sync(type);
        console.log("| INFO |"," model profile synced ");
    } catch (error) {
        console.log("| ERROR |"," model profile not synced ",error.message);
    }
}

const create=async(data)=>{
    try {
        let res = await model.create(data);
        console.log("| INFO |","user profile created",res.dataValues.user);
        return res.dataValues;
    } catch (error) {
        console.log("| ERROR |",`user not created (${data.email})`,error.message);
        return null;
    }
}

module.exports={sync,create}