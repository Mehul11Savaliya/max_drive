const { DataTypes } = require("sequelize");
const {sq} = require("../config/db");
const filemdl=require("./File");

const Permission = sq.define("permission",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    data:{
        type:DataTypes.JSONB,
        allowNull:false,
        defaultValue:{}
    },
    folder:{
        type:DataTypes.INTEGER,
        unique:true
    },
    file:{
        type:DataTypes.INTEGER,
        unique:true
    },
    user:{
        type:DataTypes.INTEGER,
        unique:true
    },
    createdBy:{
        type : DataTypes.STRING,
        allowNull:true
    },
    updatedBy:{
        type : DataTypes.STRING,
        allowNull:true
    }
},{
    freezeTableName:true,
    hooks:true
});

// Permission.belongsTo(filemdl,{foreignKey:"file",as:"file_permission"});

module.exports=Permission;