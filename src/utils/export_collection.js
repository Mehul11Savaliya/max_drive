require("dotenv").config();
const mongosrv = require("../config/mongodb");
const path = require("path");
const fs = require("fs");
const { time } = require("console");

const get_audit_collection = async () => {
    let con = null;
    try {
        con = await mongosrv.connect();
        let collection = con.db.collection("audits");
        let res = await collection.find({}).toArray();
       fs.writeFileSync(path.join("./op.json"),JSON.stringify(res));
       console.log("audits exported..");
    } catch (error) {
        throw error;
    } finally {
        con.close();
    }
}




// console.log(cleanuptime<current);
// console.log(new Date(cleanuptime).toDateString(),new Date(current).toDateString());

// let data = fs.readFileSync(path.join(__dirname,"./op.json"));
// data = JSON.parse(data);

// let tc =0;
// for(let item of data) {
//   if(item.time<cleanuptime)
//   tc++;
// }
// console.log("cleanup item : ",tc,"not cleanup :",data.length-tc);


// get_audit_collection().then((res)=>{}).catch((e)=>{console.log("utility err".bgRed,e)});

// console.log(Array.from(fs.readFileSync(path.join(__dirname,"./op.json"))));