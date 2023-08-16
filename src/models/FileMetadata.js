const { DataTypes } = require("sequelize");
const {sq} = require("../config/db");

const FileMetadata  = sq.define("FileMetadata",{
    id  : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    file :{
        type : DataTypes.INTEGER,
        unique:true,
        references :{
            model :"file",
            key : "id"
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
    },
    share_settings  : {
        type : DataTypes.JSONB
    },
    createdBy:{
        type : DataTypes.STRING,
        references :{
            model :'user',
            key : "email"
        },
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    }, 
    updatedBy:{
        type : DataTypes.STRING,
        references :{
            model :'user',
            key : "email"
        },
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    },
    other  :{
        type :DataTypes.JSONB
    }
});

module.exports=FileMetadata;