const { DataTypes } = require("sequelize");
const {sq} = require("../config/db")

const filemdl = require("./File");
const permissionmdl = require("./Permission");

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
    },
    isDeleted:{
        type : DataTypes.BOOLEAN,
        defaultValue:false
    },
    password:{
        type:DataTypes.STRING,
        defaultValue:null
    }
},{
    freezeTableName : true
});

Folder.hasMany(filemdl,{as:"files",sourceKey :"id",foreignKey:"folder"});
// Folder.hasOne(permissionmdl,{as:"folder_permission",sourceKey:"id",foreignKey:"folder"});
// filemdl.belongsTo(Folder)
module.exports=Folder;