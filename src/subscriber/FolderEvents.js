const EventEmitter = require("events");
const emmiterx = new EventEmitter();

const { insert_time_line } = require("../services/FolderAudit");

emmiterx.on("access", async(data) => {
  console.log(await insert_time_line(data));
})

module.exports = emmiterx;
