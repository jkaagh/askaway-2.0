
let online = false;

const address = {
    address: "asd"
}

if(online){
    address.address = "https://askawayapp.heroku.com"
}
else{
    address.address = "http://localhost:3001"
}
module.exports = address