let db  = {
    "AES": [
      {
        "mode": "AES-CBC",
        "ivSize": 16,
        "recommendedKeySizes": [128, 192, 256]
      },
      {
        "mode": "AES-CFB",
        "ivSize": 16,
        "recommendedKeySizes": [128, 192, 256]
      },
      {
        "mode": "AES-CFB",
        "ivSize": 8,
        "recommendedKeySizes": [128, 192, 256]
      },
      {
        "mode": "AES-CFB",
        "ivSize": 1,
        "recommendedKeySizes": [128, 192, 256]
      }
    ]
  };  

  const find=(algo)=>{
    algo = algo.toUpperCase();
    let data  = algo.split('-');
    let cipherobarr = db[data[0]];
    let mode = data[0]+"-"+data[data.length-1];
    let modeob = cipherobarr.filter((val,indx)=>{
        if (val.mode==mode) {
            return val;
        }
    });
    modeob = modeob[0];
    let bit = Number.parseInt(data[1]);
    return {
        cipher : modeob.mode,
        ivSize:modeob.ivSize,
        keySize:bit
    };

  }

 module.exports={db,algometadata:find};