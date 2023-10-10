const mongosrv = require("../config/mongodb");

const insert_time_line = async (data) => {
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("folder_timelines");
        let res = await collection.insertOne(data);
        return res.insertedId._id;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}
const get_folder_timeline=async(folderid,user,admin=null)=>{
    let con=null;
    try {
        let qrobj ={folderid:Number.parseInt(folderid)};
        if (admin==null||admin==false) {
            qrobj.author = user.email;
        }
         con = await mongosrv.connect();
        let collection = con.db.collection("folder_timelines");
        let res = await collection.find(qrobj).toArray();
        return res;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

const delete_timeline=async(folderid,user,admin=null)=>{
    folderid  = Number.parseInt(folderid);
    let con=null;
    try {
        let qrobj ={folderid:folderid};
        if (admin!=null||admin==false) {
            qrobj.author = user.email;
        }
         con = await mongosrv.connect();
        let collection = con.db.collection("folder_timelines");
        let res = await collection.deleteMany(qrobj,(err,res)=>{
            console.log(err,res);
            if (err) {
                throw new Error(`not able to delete folder timeline with id = ${id}`);
            }else{
                console.log(err,res);
            }
        });
        console.log("res from mongo : ",id,res);
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

module.exports = { insert_time_line,get_folder_timeline ,delete_timeline}