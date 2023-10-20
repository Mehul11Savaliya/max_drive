const genOtp=(length=4)=>{
    let str =  "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPSDFGHJKLZXCVBNM1234567890!@#$%^&*(){}|:";
    let len = str.length;
    let otp = "";
    for (let index = 1; index <= length; index++) {
       let idx = Number.parseInt(Math.random()*len);
       otp += str.charAt(idx);        
    }
    return otp;
}

module.exports={genOtp};