const { DataTypes } = require("sequelize");
const {sq} =require("../config/db");

const Master  = sq.define("master",{
    id:{
        primaryKey:true,
        autoIncrement:true,
        type: DataTypes.INTEGER
    },
    key:{
        type : DataTypes.STRING
    },
    value:{
        type : DataTypes.STRING
    },
    type:{
        type: DataTypes.STRING
    }
},{
    freezeTableName:true
});

module.exports=Master;