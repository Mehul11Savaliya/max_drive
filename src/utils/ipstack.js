// access_key=281950d62e1d87c029271eb1510b1027
let access_key = "281950d62e1d87c029271eb1510b1027";
const axios = require('axios');
const colors = require("colors")

const get_ip_data =  (ip,longlat) => {
    try {
    ip = ip.replace("ffff:", "");
    ip = ip.replace("::1", "");
    let apiurl = `http://api.ipstack.com/${ip}?access_key=281950d62e1d87c029271eb1510b1027`;
    console.log(apiurl.green);
    axios.get(apiurl)
        .then(response => {
            longlat(response.longitude,response.latitude);
        })
        .catch(error => {
           longlat(0,0);
        });
    } catch (error) {
        longlat(0,0);
    }
}

module.exports={get_ip_data}