let Datastore = require('nedb')
let db = new Datastore({ filename: './filequeue.db', autoload: true });

module.exports=db;