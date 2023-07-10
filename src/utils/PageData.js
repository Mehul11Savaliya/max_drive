let projectName  = process.env.PROJECT_NAME
let version = '0.0.1'
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

module.exports={generateSignupPageData,generateSigninPageData}