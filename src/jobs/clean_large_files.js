var db = require("../config/nedb");

const path = require("path");
const fs = require("fs");

const file_cleanup=(MS)=>{
    console.log("started job for file cleanup")
setInterval(()=>{
    try {
        console.log("call for job file cleanup")
        db.find({},async(err,data)=>{
            try {
                if (!err) {
                    let uploads = getFiles(path.join(__dirname,"../uploads"));
                  
                    let unsuccessfull = data.map((val)=>{
                        return val.path.split("/").pop();
                    });
        
                    console.log(unsuccessfull);
                    console.log(uploads);
                    let filestodelete =  intersection(unsuccessfull,uploads);
                    
                for(let file of filestodelete) {
                    db.remove({path:`/uploads/${file}`},(err,n)=>{
                        if (err) {
                            console.log("|ERROR|",`not able to delete in DB - ${file} - `,err.message); 
                        }else{
                            console.log("|INFO|",`deleted - ${n}`); 
                        }
                    })
                    fs.unlink(path.join(__dirname,"../uploads/"+file),(err)=>{
                        if (err) {
                            console.log("|ERROR|",`not able to delete - ${file} - `,err.message); 
                        }else{
                            console.log("|INFO|",`deleted - ${file}`); 
                        }
                    });
                }
                
        
                }   
            } catch (error) {
                console.log("|ERROR|","abortted large file clean job error-",error.message);   
            }
        });
    } catch (error) {
        console.log("|ERROR|","abortted large file clean job error-",error.message);   
    }
},MS);
}

// function to get files
function getFiles(dir, files = []) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)

  // Create the full path of the file/directory by concatenating the passed directory and file/directory name  
  for (const file of fileList) {
    const name = `${dir}/${file}`
      if (fs.statSync(name).isDirectory()) {
         continue;
      }
    files.push(name.split("/").pop());
    
  }
  return files
}

const intersection = (a, b) => new Set([...a].filter(x => b.includes(x)));

module.exports={file_cleanup}