const EventEmitter = require("events");
const emmiterx = new EventEmitter();
const notificationsrv = require("../services/notification");
emmiterx.on("push-notification",async(data)=>{
let res = await notificationsrv.insert_notification("push-notification",data);
console.log("notification inserted..",res);
})
module.exports=emmiterx;