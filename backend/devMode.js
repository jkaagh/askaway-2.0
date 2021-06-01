

let devMode = {
    enabled: true
}

const analPassword = process.env.ANALYTICS_PASSWORD

if( analPassword != undefined){
    devMode.enabled = false;
}

console.log("devMode: ", devMode.enabled)


module.exports = devMode
