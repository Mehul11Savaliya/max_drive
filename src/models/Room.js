const { DataTypes } = require("sequelize");
const {sq} =require("../config/db");

const roomemmiter = require("../subscriber/RoomEvents");

const Room  = sq.define("room",{
    id:{
        type : DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type : DataTypes.STRING,
        unique:true
    },
    description:{
        type : DataTypes.STRING
    },
    createdBy:{
        type:DataTypes.STRING,
        unique:true,
        references:{
            model:"user",
            key:"email"
        },
        onDelete:"CASCADE",
        onUpdate:"CASCADE"
    },
    data:{
        type:DataTypes.JSONB
    }
},{
    freezeTableName:true
});

Room.addHook("afterBulkDestroy",(inst,options)=>{
    console.log("deleted  : ",typeof inst);
    roomemmiter.emit("delete_room",{id:inst.where.id});
});
Room.addHook("afterUpdate",(inst,opt)=>{
    console.log("update",opt);
})

Room.addHook("afterCreate",(inst,options)=>{
    console.log("room created..",inst,options)
    roomemmiter.emit("create_room",inst.dataValues);
});

module.exports=Room;