const { DataTypes } = require("sequelize");
const {sq} = require("../config/db");

const profile = sq.define("profile",{
    id:{
        type : DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    user:{
        type : DataTypes.STRING,
        references :{
            model : "user",
            key : "email"
        },
        onDelete:"CASCADE",
        onUpdate:"CASCADE"
    },
    picture :{
        type : DataTypes.STRING,
        defaultValue : "/"
    },
    address:{
        type : DataTypes.JSONB,
        defaultValue :{
            "city" :"",
            "address" :"",
            "country":"",
            "state":""
        }
    },
    gender:{
        type  : DataTypes.INTEGER
    },
    dob:{
        type : DataTypes.DATE
    },
    age:{
        type : DataTypes.INTEGER
    },
    preferences:{
        type : DataTypes.JSONB,
        defaultValue:{
            "email_notification":false,
            "sms_notification":false,
            "when_to_email":{
                "access":false,
                "direct":false,
                "all":false
            }
        }
    },
    website:{
        type : DataTypes.STRING,
        defaultValue:"https://maxdrive.kstar.us/user/"
    },
    other:{
        type : DataTypes.JSONB,
        defaultValue : null
    }
},{
    freezeTableName : true
})

module.exports=profile;