const { DataTypes } = require("sequelize");
const {sq} = require("../config/db")

const filemdl = require("./File");

const Folder = sq.define("folder",{
    id :{
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    name :{
        type : DataTypes.STRING
    },
    tags:{
        type : DataTypes.ARRAY(DataTypes.STRING)
    },
    createdBy:{
        type : DataTypes.STRING,
        references:{
            model :"user",
            key:"email"
        },
        onDelete : "CASCADE",
        onUpdate:"CASCADE"
    },
    updatedBy:{
        type : DataTypes.STRING,
        references:{
            model :"user",
            key:"email"
        }
    }
},{
    freezeTableName : true
});

Folder.hasMany(filemdl,{as:"File",sourceKey :"id",foreignKey:"folder"});

module.exports=Folder;