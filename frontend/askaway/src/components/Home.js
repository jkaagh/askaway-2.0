import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom"
import Axios from "axios"
import ReCaptcha from "react-google-recaptcha"
import cookie from 'react-cookies'
import PreviousRoom from "./PreviousRoom"
import CookieLaw from "./CookieLaw"
import {address} from "./serverAdress"


export default function Home() {

 

    let history = useHistory();

    const [inputValue, setInputValue] = useState("")
    const [createText, setCreateText] = useState("Or create a room...")
    const [joinText, setJoinText] = useState("Join")
    const [captchaValue, setCaptchaValue] = useState()
    const [captchaWarning, setCaptchaWarning] = useState()

    

    //this entire thing is just for clicking enter to fire a function


    const handleChange = (target) => {
        setInputValue(target.toUpperCase())
        
    }

    const handleCreate = () => {
        setCreateText("Loading...")

        Axios.post(address + "/createroom", { captcha: captchaValue, })
            .then((response) => {
                if (response.data.success === false) {
                    setCaptchaWarning(response.data.msg)
                    console.log(response.data)
                    setCreateText("Or create a room...  ")


                      //shitty workaround that reloads page if you stumble upon this bug. because their docs suck ass.
                    if(captchaValue == "ass"){
                        window.location.reload()
                    }
                }
                setCaptchaValue("ass")
                
                if (response.data.roomCreated === true) {
                    let d = new Date();
                    let time = d.getTime()
                    let tomorrow = time + 86400000 // + 24 hours
                    d = new Date(tomorrow);

                    document.cookie = "adminPassword" + response.data.roomId + "=" + response.data.adminPassword + "; expires=" + d + ""
                    document.cookie = "PreviousRoom=" + response.data.roomId + "; expires=" + d + ""
                    history.push("/host/" + response.data.roomId + "")

                }
            


                //redirect to subpage todo
            })
    }

    const handleJoin = () => {
        setJoinText("Loading...");
        let existingPassword = cookie.load("userPassword" + inputValue + "");
        // console.log(existingPassword)
        console.log(inputValue)
        Axios.post(address + "/joinroom", { captcha: captchaValue, existingPassword: existingPassword, room: inputValue })
        // Axios.post("https://askawayapp.herokuapp.com/joinroom", { captcha: captchaValue, existingPassword: existingPassword, room: inputValue })
            .then((response) => {
                
                if (response.data.success === false) {
                    setCaptchaWarning(response.data.msg)
                    setJoinText("Join")
                    
                    //shitty workaround that reloads page if you stumble upon this bug. because their docs suck ass.
                    if(captchaValue == "reload"){
                        window.location.reload()
                    }
                    
                }
                setCaptchaValue("reload")
                
                if (response.data.newPassword !== undefined) { //this runs if user sent wrong or no password
                    let d = new Date();
                    let time = d.getTime()
                    let tomorrow = time + 86400000 // + 24 hours
                    d = new Date(tomorrow);

                    document.cookie = "userPassword" + response.data.roomId + "=" + response.data.newPassword + "; expires=" + d + ""
                    document.cookie = "userId" + response.data.roomId + "=" + response.data.userId + "; expires=" + d + ""
                }
                if (response.data.success === true) {
                    history.push("/room/" + response.data.roomId + "")
                }


            })
    }

    //save captcha value to post into server
    const handleCaptcha = (value) => {
        setCaptchaValue(value)
    }

    return (
        <div className="container text-center px-6">
            <div className="container pb-4">
                <h1 className="title">Askaway</h1>
                {/* <h1 className="display-4 d-sm-none text-wrap">Askaway</h1> */}

                <h4 className="font-bold">The free service that lets you ask anonymous questions live.</h4>
                <a href="readmore" id="" className="btn-link">Read more</a>

            </div>

        



            <div className="container w-sm-50">
                <input 
                maxLength="4"
                onChange={(e) => handleChange(e.target.value)}
                onKeyPress={(e) => {
                    if(e.key === "Enter"){
                        handleJoin()
                        
                    }
                }} 
                value={inputValue} id="codeInput" 
                className="form-control text-center customInput" 
                type="text" placeholder="Type room code here to join" 
                name="askawayInput" 
                />

                <div className="container flex flex-wrap justify-center mt-4">
                    <ReCaptcha
                        sitekey="6LdqX4saAAAAAC3Cie6ilnn6ujzvKuiMm2tjYeWG"
                        onChange={handleCaptcha}
                        
                    /> 

                </div>
                <span className="text-red-600 block">
                    {captchaWarning}
                </span>

                <button onClick={handleJoin} className=" btn btn-primary px-4 m-4 customButton">{joinText}</button>

            </div>

            <div className="container">
                {/* <Link to={"/room/" + }> */}
                <button onClick={handleCreate} className="btn btn-link alert-link ">{createText}</button>
                {/* </Link> */}
            </div>

            <PreviousRoom />
            <CookieLaw/>
        </div>
    )
}
