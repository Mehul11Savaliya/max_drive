let projectName  = process.env.PROJECT_NAME
let version = '1.9.8'
const generateSignupPageData = ()=>{
    return {
        name : projectName,
        version : version,
        title  : 'Max Drive | SignUP'
    }
}

const generateSigninPageData = ()=>{
    return {
        name : projectName,
        version : version,
        title  : 'Max Drive | SignIN'
    }
}

const generategeneralData=()=>{
    return {
        name : projectName,
        version : version,
        title  : 'Max Drive | SignIN'
    }
}

module.exports={generateSignupPageData,generateSigninPageData,generategeneralData}