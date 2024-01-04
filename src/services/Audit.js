const mongosrv = require("../config/mongodb");

const set_page_by_user=async(urlcomps,ip)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("audits");
        let data = {type:"page_request"};
        data.urls = urlcomps;
        data.ip = ip;
        data.time = Date.now();
        let res = await collection.insertOne(data);
        return {id:res.insertedId._id,...data};
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }

}

const get_page_by_user=async()=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("audits");
        let res = await collection.find().toArray();
        return res;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

module.exports={set_page_by_user,get_page_by_user}