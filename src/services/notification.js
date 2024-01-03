const mongosrv = require("../config/mongodb");

const insert_notification = async (type,data) => {
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("notification");
        //for push notificaotion
        let res = await collection.insertOne({
            type:type,
            user:data.to,
            content:data
        });
        return res.insertedId._id;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

const get_notification=async(user)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("notification");
        let res = await collection.find({["content.to"]:user.email}).sort({time:-1}).toArray();
        return {
            count:res.length,
            data : res
        };
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}
// get_notification({email:"mrxy373@gmail.com"}).then((val)=>{
//     console.log(val);
// })

module.exports={insert_notification,get_notification}

