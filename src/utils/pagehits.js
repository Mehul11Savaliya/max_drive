const fs = require("fs");
const path = require("path");

// let data = fs.readFileSync(path.join(__dirname, "./audit.json"));

// data = JSON.parse(data);


const catagprized_pagehits=(data)=>{
    function filter_catg (arr){
        if (arr[0] == "/") {
            return "home"
        }
        let val = "others";
        switch (arr[1]) {
            case "analytics":
                val = "analytics";
                break;
            case "user":
                val = "dashboard";
                break;
            case "user":
                if (arr[2] == "folder") {
                    val = "folder";
                }
                if (arr[2] == "file") {
                    val = "file";
                }
                if (arr[2] == "recent") {
                    val = "recent";
                }
                if (arr[2] == "favorite") {
                    val = "favorite";
                }
                break;
            case "file":
                val = "file"
                break;
                case "folder":
                    val = "folder"
                break;
            case "auth":
                if (arr[2] == "signin") {
                    val = "signin"
                }
                if (arr[2] == "signup") {
                    val = "signup"
                }
                val = "others";
                break;
            case "admin":
                if (arr[2] == "userlist") {
                    val = "userlist"
                }
                if (arr[2] == "analytics") {
                    val = "analytics"
                }
                val = "others";
                break;
            case "explore":
                val = "explore";
                break;
            case "rooms":
                val = "rooms";
                break;
            case "bugs":
                val = "bugs";
                break;
            case "share":
                switch (arr[2]) {
                    case "folder":
                        val ="sharefolder";
                        break;
                    case "file":
                        val ="sharefile";
                        break;
                    default:
                        val = "liveshare";
                        break;
                }
                break;
            default:
                val = "others";
                break;
        }
       return val;
    }
    let pagehitdata = new Map();
    let pagehittmplt = {
        home: 0,
        signin: 0,
        signup: 0,
        folder: 0,
        file: 0,
        dashboard: 0,
        userlist: 0,
        analytics: 0,
        recent: 0,
        favorite: 0,
        explore: 0,
        bigswall: 0,
        rooms: 0,
        liveshare: 0,
        others: 0
    }
    let ips = [];
    for (let datax of data) {
        ips.push([datax.latitude,datax.longitude]);
        let date = new Date(datax.time);
        let currob = pagehitdata.get(date.getMonth() + 1);
        // console.log(filter_catg(datax.urls))
        let cat = filter_catg(datax.urls);
        if (currob == undefined) {
            //if map dont have month
              currob =pagehittmplt;
              currob[cat] = 1;
        } else {
            //if have
            currob[cat]=currob[cat]+1;
        }
        pagehitdata.set(date.getMonth() + 1,currob);
    }
    pagehitdata.set("locations",ips);
    return pagehitdata;
}

module.exports={catagprized_pagehits}