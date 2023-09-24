const EventEmitter = require("events");
const emmiterx = new EventEmitter();

const mongosrv = require("../config/mongodb");
const { insert_time_line } = require("../services/FileAudit");

emmiterx.on("share", async(data) => {
  console.log(await insert_time_line(data));
})

module.exports = emmiterx;
