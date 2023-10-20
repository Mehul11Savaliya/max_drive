const model = require('../models/Auth');

const sync=async(type)=>{
await model.sync(type);
}

const create=async(obj)=>{
     return (await model.create(obj)).dataValues;
}

const get_by_id=async(id,plain=false)=>{
    let res = await model.findOne({
        where:{
        id:id
    },
raw:plain});
    if (res==null) {
        throw new Error(`auth with id=${id} not exist..`);
    }
    return res;
}

const update=async(id,obj)=>{
    let old = await get_by_id(id);
    let {email,otp,attempts,varified,refresh_toke}=obj;
    if (email!=undefined) {
        old.email = email;
    }
    if (otp!=undefined) {
        old.otp = otp;
    }
    if (attempts!=undefined) {
        old.attempts = attempts;
        old.changed("attempts",true);
    }
    if (varified!=undefined) {
        old.varified = varified;
    }
    if (refresh_toke!=undefined) {
        old.refresh_toke = refresh_toke;
    }
    let resx = (await old.save()).dataValues;
    return resx;
}



module.exports={
    sync,
    create,
    update,
    get_by_id
}