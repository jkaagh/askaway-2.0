
let online = false;

const address = {
    address: "asd"
}

if(online){
    address.address = "https://askawayapp.herokuapp.com"
}
else{
    address.address = "http://localhost:3001"
}
module.exports = address