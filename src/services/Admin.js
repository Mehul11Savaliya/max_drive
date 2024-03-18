const { encrypt } = require("../utils/CryptoGraph");
const usersrv = require("../services/User");
const authsrv = require("../services/Auth");
const profilesrv = require("../services/Profile");

const elect_admin=async()=>{
    let ADMIN_USERNAME = process.env.ADMIN_USERNAME
let ADMIN_EMAIL = process.env.ADMIN_EMAIL
let ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME
let ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
    try {
console.log(ADMIN_USERNAME,ADMIN_EMAIL,ADMIN_FIRST_NAME,ADMIN_LAST_NAME,ADMIN_PASSWORD);
ADMIN_PASSWORD = encrypt(ADMIN_PASSWORD);
let res = await usersrv.create({
    username : ADMIN_USERNAME,
    first_name : ADMIN_FIRST_NAME,
    last_name : ADMIN_LAST_NAME,
    password : ADMIN_PASSWORD,
    email : ADMIN_EMAIL
});
let auth =  await authsrv.create({
    email: ADMIN_EMAIL,
    refresh_toke: "",
    attempts:{
        varify:3
    },
    otp:"XXX",
    varified:true,
    role:"admin"
});
let profile = await profilesrv.create({
    user : ADMIN_EMAIL,
    picture: "uploads/pp/default.gif",
    preferences:{
        "email_notification":true,
        "sms_notification":true,
        "when_to_email":{
            "access":true,
            "direct":true,
            "all":true
        }
    },
    website :"https://maxdrive.kstar.us"
});

console.log("| WARNING |",`admin user eletcted (${ADMIN_EMAIL})`)
} catch (error) {
    console.log(error);
console.log("| ERROR | ",`not able to elect admin (${ADMIN_EMAIL})`,error.message);
}
}

module.exports={elect_admin}