const mongoose = require('mongoose');

let db = mongoose.connection;

const connect = async () => {
  try {
    let con = await mongoose.createConnection("mongodb://127.0.0.1:27017/max_drive").asPromise();
    if (con.readyState != 1) return null;
    return con;
  } catch (error) {
    return null;
  }
}

const close = () => {
  con.close({})
}

module.exports = { connect, close };