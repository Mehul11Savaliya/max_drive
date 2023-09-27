const EventEmitter = require("events");
const emmiterx = new EventEmitter();

const filesrv = require("../services/File");

emmiterx.on("download",async(data)=>{
    if (data!=undefined) {
        let {id,downloads,user} = data;
        if (id!=undefined||downloads!=undefined||auther!=undefined) {
            try {
                let res = await filesrv.update_by_id(id,{downloads:downloads});
            } catch (error) {
                console.log(error);  
            }
        }
    }
})

module.exports=emmiterx;