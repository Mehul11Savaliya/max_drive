const nano = require('nano')('http://couchdb:root@127.0.0.1:5984'); // Replace with your CouchDB URL
const dbName = 'max_drive';
const db = nano.db.use(dbName);

const getConnection=()=>{
  db.list((err, body) => {
    if (err) {
      return null;
    }
    if (body.includes(dbName)) {
      return db;
    } else {
      return null;
    }
  });
}

module.exports={getConnection,db};



