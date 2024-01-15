
const mongosrv = require("../config/mongodb");
const { ObjectId } = require('mongoose').Types;
const filehndlr = require("../services/FileHandler");
const path = require("path");

const create=async(data,attachment)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("bugs");
        let bug = {};
        bug.title = data.title;
        bug.description = data.description;
        bug.owner = data.owner;
        bug.status = "open";
        bug.attachments = attachment; 
        let res = await collection.insertOne(bug);
        return {id:res.insertedId._id,...bug};
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }

}

const get_all=async()=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("bugs");
        let res = await collection.find().toArray();
        return res;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

const delete_bug=async(id,onlyfiles)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("bugs");
        let res = await collection.findOne({_id:new ObjectId(id)});
        let files = res.attachments;
        if (files!=undefined) {
            for(let file of files) {
              filehndlr.delete_file(path.join(__dirname,".."+file));
            }
         await collection.findOneAndUpdate({_id:new ObjectId(id)},{$set:{attachments:[]}},{});
        }
        console.log(onlyfiles);
        if (onlyfiles) {
            res = "only file is deleted..";    
        }
        if(!onlyfiles){
        res = await collection.deleteOne({_id:new ObjectId(id)});
        res = "whole bug is deleted..";
    }
      
        return res;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}

const update_bug_status=async(id,status)=>{
    let con=null;
    try {
         con = await mongosrv.connect();
        let collection = con.db.collection("bugs");
        let res = await collection.findOneAndUpdate({_id:new ObjectId(id)},{$set:{status:status}},{new :true});
        return res;
    } catch (error) {
        throw error;
    }finally{
        con.close();
    }
}
module.exports={create,get_all,delete_bug,update_bug_status};