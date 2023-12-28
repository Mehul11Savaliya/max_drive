
const mongosrv = require("../config/mongodb");

const create=async(data,attachment)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("bugs");
        let bug = {};
        bug.title = data.title;
        bug.description = data.description;
        bug.owner = data.owner;
        bug.status = "open";
        bug.attachments = attachment; 
        let res = await collection.insertOne(bug);
        return {id:res.insertedId._id,...bug};
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }

}

const get_all=async()=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("bugs");
        let res = await collection.find().toArray();
        return res;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}
module.exports={create,get_all};