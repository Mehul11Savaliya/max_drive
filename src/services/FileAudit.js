const mongosrv = require("../config/mongodb");

const insert_time_line = async (data) => {
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("file_timelines");
        let res = await collection.insertOne(data);
        return res.insertedId._id;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}
const get_file_timeline=async(fileid)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("file_timelines");
        let res = await collection.find({fileid:fileid}).toArray();
        return res;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

const delete_timeline=async(id)=>{
    id  = Number.parseInt(id);
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("file_timelines");
        let res = await collection.deleteMany({
            fileid :id
        },(err,res)=>{
            console.log(err,res);
            if (err) {
                throw new Error(`not able to delete timeline with id = ${id}`);
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

module.exports = { insert_time_line,get_file_timeline ,delete_timeline}