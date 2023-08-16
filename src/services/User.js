const model = require('../models/User');
const { encrypt } = require('../utils/CryptoGraph');

const sync=async()=>{
   await model.sync();
}

const varifyUser=async(email,pass)=>{
     pass = encrypt(pass);
    let res = null;
    res  = await model.findOne({
        where:{
            email : email,
            password : pass
        }
    });
    if(res===null) throw new Error(`user with email = ${email} not exist..`);
    res = res.dataValues;
    return res;
}

const getUserByEmail=async(email,raw=false)=>{
    let res = null;
    res = await model.findByPk(email);
    if(res===null) throw new Error(`user with email = ${email} not exist..`);
    return raw?res:res.dataValues;
}

const create=async(obj)=>{
    return (await model.create(obj)).dataValues;
}

module.exports={
    sync,
    create,
    varifyUser,
    getUserByEmail
}