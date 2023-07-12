const { DataTypes } = require('sequelize');
const {sq} = require('../config/db');

const authmdl = require('./Auth');

const User  = sq.define('user',{
    id:{
        type : DataTypes.INTEGER,
        autoIncrement : true
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
        type : DataTypes.STRING
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


module.exports=User