const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const uuid = require("uuid");
const sharp = require("sharp");
const archiver = require("archiver");

const { algometadata } = require("../utils/encryptiondb");

const move_file_to = (buffer, pathx) => {
    let dest = path.join(__dirname, pathx);
    fs.writeFile(dest, buffer, (err) => {
        if (err) throw new Error(`not able to save a file`);
    });
    return pathx.substring(2);
}

const delete_file = (path) => {
    fs.unlink(path, (err) => {
        if (err)
            throw new Error(`not able to delete file path = ${path}`);
        else
            console.log(path+" file deleted..");
            return 0;
    })
}

const encrypt_file = (patx, algorithm, cb) => {
    let meta = algometadata(algorithm);
    // console.log(meta);
    // var key = crypto.randomBytes(Number.parseInt(meta.keySize)/8);
    // console.log(key);
    var key = "", iv = "";
    let str = "789456123qwertyuiopasdfghjklzcvbnm!@#$%^&*()_+";
    for (let index = 1; index <= Number.parseInt(meta.keySize) / 8; index++) {
        let c = Math.round(Math.random() * str.length);
        key += str.charAt(c);
    }
    for (let index = 1; index <= Number.parseInt(meta.ivSize); index++) {
        let c = Math.round(Math.random() * str.length);
        iv += str.charAt(c);
    }

    let uuidname = patx.split('/');
    uuidname = uuidname[uuidname.length - 1].split('.')[0];

    fs.readFile(path.join(__dirname, ".." + patx), (err, data) => {
        if (err) {
            throw new Error(`not able to input file..`);
        }
        else {
            // const iv = crypto.randomBytes(Number.parseInt(meta.ivSize));
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            const encryptedData = Buffer.concat([
                cipher.update(data),
                cipher.final()
            ]);

            const outputFile = uuidname + '.enc';
            const encryptedObject = {
                iv: iv.toString('hex'),
                encryptedData: encryptedData.toString('hex')
            };

            fs.writeFile(path.join(__dirname, "../uploads/" + outputFile), JSON.stringify(encryptedObject, null, 2), (err) => {
                if (err) {
                    throw new Error(`not able to save a encrypted file ...`);
                }
                else {
                    cb(null, key, iv);
                }
            });

        }
    });

}

const decrypt_file_v2 = (input_file, output_file, algo, key, iv, cb) => {
    let decipher = crypto.createDecipheriv(algo, key, iv);
    decipher.on("error", (err) => {
        cb(err, null);
    })

    const readStream = fs.createReadStream(input_file);//path.join(__dirname, ".." + input_file));
    const writeStream = fs.createWriteStream(output_file);//path.join(__dirname, ".." + output_file));

    readStream.pipe(decipher).pipe(writeStream);

    readStream.on("error", (err) => {
        cb(err, null);
    })
    writeStream.on('finish', () => {
        cb(null, output_file);
    });
    writeStream.on("error", (err) => {
        cb(err, null);
    })
}

const encrypt_file_v2 = (input_path, algorithm, cb) => {
    let meta = algometadata(algorithm);
    console.log(meta);
    var key = "", iv = "";
    let str = "789456123qwertyuiopasdfghjklzcvbnm!@#$%^&*()_+";
    for (let index = 1; index <= Number.parseInt(meta.keySize) / 8; index++) {
        let c = Math.round(Math.random() * str.length);
        key += str.charAt(c);
    }
    for (let index = 1; index <= Number.parseInt(meta.ivSize); index++) {
        let c = Math.round(Math.random() * str.length);
        iv += str.charAt(c);
    }

    let uuidname = input_path.split('/');
    uuidname = uuidname[uuidname.length - 1].split('.')[0];
    output_file = uuidname + ".enc";

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let stats = fs.statSync(path.join(__dirname, ".." + input_path));
    if (stats.size > 8 * 1024 * 1024 * 50) {
        throw new Error(`file size large...`);
    }
    const input = fs.createReadStream(path.join(__dirname, ".." + input_path));
    const output = fs.createWriteStream(path.join(__dirname, "../uploads/" + output_file));
    input.pipe(cipher).pipe(output);
    output.on('finish', () => {
        cb(null, key, iv);
    });
    output.on("error", (err) => {
        console.log(err);
        cb(err, null, null);
    })

}

const gen_thumb_nail = (path, width = 200, height = 200, cb) => {
    const thumbnailWidth = width;
    const thumbnailHeight = height;

    sharp(path)
        .resize(thumbnailWidth, thumbnailHeight)
        .toFormat("webp")
        .toBuffer((err, data) => {
            if (err) {
                cb(new Error(`Error generating thumbnail + ${err.message}`), null);
            } else {
                //   // Set response headers to indicate it's an image
                //   res.set('Content-Type', 'image/jpeg');
                //   res.set('Content-Disposition', 'inline; filename=thumbnail.jpg');

                // Send the generated thumbnail data to the frontend
                cb(null, data);
            }
        });
}

// encrypt_file_v2('/uploads/1.zip', 'aes-128-cbc', (err, key, iv) => {
//     console.log(err, key, iv);
// });
// decrypt_file_v2("/uploads/42b01c67-2b32-491e-87f5-2df0bab2654b.enc", "/uploads/op.txt", "sm4-cbc", "gmf5nczce2fvgp@j", "*fc1+ql8mz(6ca8e", (err, op) => {
//     console.log(err, op);
// })

const convert_file_to = (path, target_type) => {
    pandoc(path, '-f docx -t markdown -o ./markdown.md', (err, res) => {
        console.log(err, res);
    })
}

const make_zip =  (array, cb) => {
   let zip = new jszip();
    const zipx = zip.folder("data🐦");
    const pathx = path.join(__dirname, "../tmp/" + `${Date.now()}.zip`);
    let p = new Promise((res, rej) => {
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            // if (element.type == "file") {
                //folder || file
                var filedata = null;
                filedata = fs.readFileSync(path.join(__dirname, ".." + element.path));
                zipx.file(element.name, filedata);
                // const readStream = fs.createReadStream(path.join(__dirname, ".." + element.path));
                // readStream.on("data", (chunk) => {
                //     filedata += chunk;
                // })
               
                // readStream.on("end", () => {
                //     zipx.file(element.name, fileData);
                // });
            // }
        }
        res(zipx);
    });
    p.then((res) => {
        res.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(pathx))
            .on('finish', function () {
                cb(pathx)
            });
    })

}

const make_zip_2=(dataarr,res)=>{
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${Date.now()}.zip`);
    // const outputZip = fs.createWriteStream('./output.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level (0-9)
    });
    
    // outputZip.on('close', () => {
    //   console.log('Zip file created successfully.');
    // });
    
    // archive.pipe(outputZip);
    archive.pipe(res);
    
    // Define an array of file paths
    const items = dataarr;
    
    items.forEach((item) => {
        if (item.type=="file") {
            archive.file(path.join(__dirname,".."+item.path), { name: item.name });
        }
    });
    archive.finalize();
  }

// make_zip([
//     {
//         "type": "file",
//         "name": "Night.Sky.S01E07.Lake.Diving.720p.10bit.English.Esubs.MoviesVerse.app.mkv",
//         "path": "/uploads/f1086d39-61f7-4925-8381-0c3f1ba985ae.mkv"
//     },
//     {
//         "type": "file",
//         "name": "Night.Sky.S01E08.Compensation.720p.10bit.English.Esubs.MoviesVerse.app.mkv",
//         "path": "/uploads/a454af6a-2ebb-45a9-bd76-117fad648268.mkv"
//     }], (path) => {
//         console.log(path);
//     })
const fpath =[
   
    {
      type: 'file',
      name: 'xampp-windows-x64-8.1.2-0-VS16-installer.exe',
      path: '/uploads/4bfe8b46-9fcf-4020-a4d6-576b9f915a83.exe'
    }
  ]

// make_zip_2(fpath,undefined);

module.exports = {
    move_file_to,
    delete_file,
    encrypt_file_v2,
    decrypt_file_v2,
    gen_thumb_nail,
    make_zip,
    make_zip_2
}