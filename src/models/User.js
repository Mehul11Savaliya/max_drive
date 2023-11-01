const { DataTypes } = require('sequelize');
const {sq} = require('../config/db');

const authmdl = require('./Auth');
const foldermdl = require('./Folder');
const filemdl = require("./File");
const filemetadatamdl = require('./FileMetadata');
const roommdl = require("./Room");

const User  = sq.define('user',{
    id:{
        type : DataTypes.INTEGER,
        autoIncrement : true
    },
    username:{
        type:DataTypes.STRING(15),
        unique:true,
        allowNull:false
    },
    email:{
        type : DataTypes.STRING,
        primaryKey:true 
    },
    first_name :{
        type : DataTypes.STRING
    },
    last_name :{
        type : DataTypes.STRING
    },
    password :{
        type : DataTypes.STRING(256)
    },
    phone:{
        type : DataTypes.STRING
    },
    profile:{
        type : DataTypes.STRING
    }
},{
    freezeTableName:true
});

User.hasOne(authmdl,{as:'Auth',sourceKey:'email',foreignKey:'email'});
User.hasMany(foldermdl,{as:"Folders",sourceKey:"email",foreignKey:"createdBy"});
User.hasMany(filemdl,{as :"Files",sourceKey:"email",foreignKey:"createdBy"});
User.hasMany(filemetadatamdl,{as:"fkey_user_filemetada_ctby",sourceKey :"email",foreignKey:"createdBy"});
User.hasMany(filemetadatamdl,{as:"fkey_user_filemetada_upby",sourceKey :"email",foreignKey:"updatedBy"});
User.hasOne(roommdl,{as:"fkey_user_room",sourceKey:"email",foreignKey:"createdBy"});

module.exports=User