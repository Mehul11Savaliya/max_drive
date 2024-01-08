const mongosrv = require("../config/mongodb");
const ipdata = require("../utils/ipstack");

const set_page_by_user=async(urlcomps,ip)=>{
    let con=null;
    try {
        let data = {type:"page_request"};
        data.urls = urlcomps;
        data.ip = ip;
        ipdata.get_ip_data(ip,async(long,lat)=>{
            con = await mongosrv.connect();
            let collection = con.db.collection("audits");
            data.time = Date.now();
            data.longitude = long;
            data.latitude = lat;
            let res = await collection.insertOne(data);
            return {id:res.insertedId._id,...data};
        })
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