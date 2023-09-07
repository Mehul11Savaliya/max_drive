require("dotenv").config();
const nodemailer = require('nodemailer');

const transporterconfig = {
    host: process.env.COMM_SMTP_HOST,
    port: 2525,
    auth: {
        user: process.env.COMM_EMAIL,
        pass: process.env.COMM_EMAIL_PASS
    }};

async function sendMain() {
    const transporter = await nodemailer.createTransport(transporterconfig);
        const msg  = await transporter.sendMail({
            from:'noreply-maxdrive <mrxy373@gmail.com>',
            to:"svlmehul@gmail.com",
            text:"hello master",
            html:"<p>nntwai</p>"
        });
        console.log(msg);

}

const send_file_encryption_message=async (recever,key,iv,originalfilename,encryptfilename,algo)=>{
    let msg ;

    const transporter = await nodemailer.createTransport(transporterconfig);
    
    try {
     msg = await  transporter.sendMail({
            from:`noreply-maxdrive <${process.env.COMM_EMAIL}>`,
            to:recever,
            subject:`${encryptfilename} keys`,
            html:`
            <table border="1" cellpadding="2pc" style="font-size:22px">
            <tr>
            <td><b>Orignal Filename : </b></td>
            <td>${originalfilename}</td>
            </tr>
            <tr>
            <td><b>Encrypted Filename : </b></td>
            <td>${encryptfilename}</td>
            </tr>
            <tr>
            <td><b>Algorithm : </b></td>
            <td>${algo}</td>
            </tr>
            <tr>
            <tr>
            <td><b>Encryption Key : </b></td>
            <td>${key}</td>
            </tr>
            <tr>
            <td><b>IV : </b></td>
            <td>${iv}</td>
            </tr>
            </table>
            `
        });
    } catch (error) {
        console.log(error);
        msg = null;
    }
    return msg;
}

// (async()=>{
//    await send_file_encryption_message('testfor050@gmail.com',"123","123","123","123");
// })()

module.exports={send_file_encryption_message};