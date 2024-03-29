const { DataTypes } = require("sequelize");
const {sq} = require("../config/db");

const filemetadatamdl = require("./FileMetadata");
const permissionmdl = require("./Permission");

const File = sq.define("file",{
    id:{
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
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
    tags:{
        type : DataTypes.ARRAY(DataTypes.STRING)
    },
    folder:{
        type : DataTypes.INTEGER,
        references :{
            model : "folder",
            key :"id"
        },
        onDelete : "CASCADE",
        onUpdate:"CASCADE"
    },
    metadata:{
        type : DataTypes.JSONB
    },
    password:{
        type:DataTypes.STRING,
        defaultValue:null
    },
    downloads:{
        type : DataTypes.BIGINT,
        defaultValue:0
    },
    favorite:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    like:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    dislike:{
        type:DataTypes.INTEGER,
        defaultValue:0
    }
},
{
    freezeTableName : true,
    hooks:true
});

File.addHook("afterBulkDestroy",(inst,options)=>{
    console.log("deleted  : ",inst);
});

File.hasOne(filemetadatamdl,{as:"fkey_file_metadata",sourceKey:"id",foreignKey:"file"});
File.hasOne(permissionmdl,{as:"file_permission",sourceKey:"id",foreignKey:"file"});
module.exports = File;