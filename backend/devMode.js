

let devMode = {
    enabled: false
}

const analPassword = process.env.ANALYTICS_PASSWORD

if( analPassword != undefined){ //which means it is on the public server.
    devMode.enabled = false;
}

console.log("devMode: ", devMode.enabled)


module.exports = devMode
