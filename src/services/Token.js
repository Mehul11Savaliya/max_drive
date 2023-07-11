const jwt = require("jsonwebtoken");

let accesskey = process.env.ACCESS_TOKEN_SECRET;
let refreshkey  = process.env.REFRESH_TOKEN_SECRET;

const createTokens=(data)=>{
let access = jwt.sign(data,accesskey,{
    expiresIn:'5h'
});
let refresh = jwt.sign(data,refreshkey,{
    expiresIn:'1d'
});
return {
access : access,
refresh : refresh
};
}

const extract=()=>{}

module.exports={
    createTokens
}
