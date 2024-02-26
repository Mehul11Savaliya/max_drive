const model = require('../models/User');
const { encrypt } = require('../utils/CryptoGraph');
const authmdl=  require("../models/Auth");

const sync=async(type)=>{
   await model.sync(type);
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

const delete_by_email=async(email)=>{
    let res = await model.destroy({
        where:{
            email : email
        }
    });
    return res;
}

const getUserByEmail=async(email,raw=false)=>{
    let res = null;
    // res = await model.findByPk(email);
    res = await model.findOne({
        include:[{model:authmdl,as:"Auth"}],
        where:{
            email:email
        },
        // raw:!raw
    })
    if(res===null) throw new Error(`user with email = ${email} not exist..`);
    // return res;
    return raw?res:res.dataValues;
}

const create=async(obj)=>{
    return (await model.create(obj)).dataValues;
}

const get_list=async(role,plain)=>{
    if (role!=="admin") {
        throw new Error(`not authorized`)
    }
    let res = await model.findAll({raw:plain});
    return res;
}


const delete_inactive_after=(sec,userid,authid)=>{
    setTimeout(async() => {
        let auth = await authmdl.findOne({
            where:{
                id:authid
            }
        });
        if (!auth.varified) {
            await model.destroy({
                where:{
                    id:userid
                }
            });
            console.log(`user deleted after inactive for ${sec}`.bgBlue);
        }
    }, sec);
}

module.exports={
    sync,
    create,
    varifyUser,
    getUserByEmail,
    delete_by_email,
    get_list,
    delete_inactive_after
}