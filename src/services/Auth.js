const model = require('../models/Auth');

const sync=async()=>{
await model.sync({force:true});
}

const create=async(obj)=>{
     return (await model.create(obj)).dataValues;
}



module.exports={
    sync,
    create
}