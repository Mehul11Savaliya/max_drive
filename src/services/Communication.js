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

const send_otp_varify_msg=async(recever,otp,varifylink)=>{
    let msg ;

    const transporter = await nodemailer.createTransport(transporterconfig);
    
    try {
     msg = await  transporter.sendMail({
            from:`noreply-maxdrive <${process.env.COMM_EMAIL}>`,
            to:recever,
            subject:`Varify your account`,
            html:`<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${process.env['PROJECT_NAME']}</a>
              </div>
              <p style="font-size:1.1em">Hi,</p>
              <p>Thank you for choosing ${process.env['PROJECT_NAME']}. Use the following OTP to complete your Sign Up procedures. OTP is valid for 3 attempts</p>
              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
              <p style="font-size:0.9em;">Regards,<br />${process.env['PROJECT_NAME']}</p>
              <hr style="border:none;border-top:1px solid #eee" />
              <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>${process.env['PROJECT_NAME']}</p>
                <p>GJ14</p>
                <p>India</p>
              </div>
            </div>
          </div>`
        });
    } catch (error) {
       throw new Error(`not able to send otp try again..`)
    }
}

// (async()=>{
//    await send_file_encryption_message('testfor050@gmail.com',"123","123","123","123");
// })()

module.exports={send_file_encryption_message,send_otp_varify_msg};