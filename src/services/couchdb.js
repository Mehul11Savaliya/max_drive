const {getConnection,db} = require("../config/couchdb");



const insertFileTimeline=(fileid,data)=>{
    let doc ={
        fileid : fileid,
        data : data
    };
    db.insert(doc,(err,resp)=>{
        if (err) {
            return null;
        }else{
            return resp;
        }
    })
}

module.exports={insertFileTimeline};
