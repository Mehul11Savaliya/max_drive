const model = require('../models/User');

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