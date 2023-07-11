const { DataTypes } = require('sequelize');
const {sq} =require('../config/db');

const Auth = sq.define('auth',{
    id :{
        type : DataTypes.INTEGER,
        autoIncrement:true
    },
    email:{
        type : DataTypes.STRING,
        primaryKey:true,
        references:{
            model:'user',
            key:'email'
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
    },
    refresh_toke:{
        type : DataTypes.STRING
    }
},{
    freezeTableName:true
});

module.exports=Auth;