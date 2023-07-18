const { DataTypes } = require("sequelize");
const {sq} = require("../config/db");

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
    }
},
{
    freezeTableName : true
});

module.exports = File;