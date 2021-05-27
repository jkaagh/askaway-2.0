

let devMode = {
    enabled: true
}

const analPassword = process.env.ANALYTICS_PASSWORD

if( analPassword != undefined){
    devMode.enabled = false;
}

console.log(devMode)
console.log(analPassword)

module.exports = devMode
