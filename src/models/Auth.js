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
    otp:{
        type:DataTypes.STRING(6)
    },
    attempts:{
        type:DataTypes.JSONB
    },
    varified:{
        type:DataTypes.BOOLEAN
    },
    refresh_toke:{
        type : DataTypes.STRING(400)
    },
    role:{
        type : DataTypes.STRING,
        values:["admin","user","other"],
        defaultValue:"user"
    }
},{
    freezeTableName:true
});

module.exports=Auth;