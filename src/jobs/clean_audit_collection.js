const mongosrv = require("../config/mongodb");
require("dotenv").config();
const color = require("colors");

const start=()=>{
    console.log("start call")
    setInterval(async() => {
        console.log("in the interval")
        const current = new Date().getTime();
        const cleanuptime = current - (Number.parseInt(process.env.JOB_AUDIT_CLEANUP_DAY)*24*60*60*1000);
            mongosrv.connect().then((con)=>{
                // console.log(con);
                let collection = con.db.collection("audits");
                collection.deleteMany({
                    time:{$lte:cleanuptime}
                }).then((res)=>{
                    console.log("audit collection cleanup job success : ".bgBlue,res);
                }).catch((err)=>{
                    console.log("audit collection cleanup job mongo error : ".bgBlue,err);
                });
            }).catch(erxr=>{
                console.log("audit collection cleanup job error : ".bgBlue,erxr);
            })
    }, 24*60*60*1000);
}

start();
module.exports={start}