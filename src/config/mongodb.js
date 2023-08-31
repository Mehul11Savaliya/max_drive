const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/max_drive");
let db  = mongoose.connection;

let con;

con=db.on('error',function () {
  return null;
})

con = db.once("open",function () {
  return db;
});

con.close({})