import React, {useState, useEffect} from 'react'
import {useHistory} from "react-router-dom"
import Axios from "axios"
import ReCaptcha from "react-google-recaptcha"
import cookie from 'react-cookies'
import PreviousRoom from "./PreviousRoom"
export default function Home() {
    let history = useHistory();

    const [inputValue, setInputValue] = useState()
    const [createText, setCreateText] = useState("Or create a room...")
    const [joinText, setJoinText] = useState("Join")
    const [captchaValue, setCaptchaValue] = useState()
    const [captchaWarning, setCaptchaWarning] = useState()

  

    const handleChange = (target) => {        
        setInputValue(target.toUpperCase())
    }

    const handleCreate = () => {
        setCreateText("Loading...")
       
        Axios.post("http://localhost:3001/createroom", {captcha: captchaValue, })
        .then((response) =>{
            if(response.data.success === false){
                setCaptchaWarning(response.data.msg)
                console.log(response.data)
            }
            if(response.data.roomCreated === true){
                let d = new Date();
                let time = d.getTime()
                let tomorrow = time + 86400000 // + 24 hours
                d = new Date(tomorrow);

                document.cookie = "adminPassword" + response.data.roomId + "=" + response.data.adminPassword + "; expires=" + d + ""
                document.cookie = "PreviousRoom=" + response.data.roomId + "; expires=" + d + ""
                history.push("/host/" + response.data.roomId + "")

            }
            console.log(response.data)

            
            //redirect to subpage todo
        })
    }

    const handleJoin = () => {
        setJoinText("Loading...");
        let existingPassword = cookie.load("userPassword" + inputValue + "");
        // console.log(existingPassword)
        Axios.post("http://localhost:3001/joinroom", {captcha: captchaValue, existingPassword: existingPassword, room: inputValue})
        .then((response) => {
            if(response.data.success === false){
                setCaptchaWarning(response.data.msg)
            }
            console.log(response.data)
            if(response.data.newPassword != undefined){ //this runs if user sent wrong or no password
                let d = new Date();
                let time = d.getTime()
                let tomorrow = time + 86400000 // + 24 hours
                d = new Date(tomorrow);

                document.cookie = "userPassword"    + response.data.roomId      + "="   + response.data.newPassword + "; expires=" + d + ""
                document.cookie = "userId"          + response.data.roomId      + "="   + response.data.userId      + "; expires=" + d + ""
            }
            if(response.data.success === true){
                history.push("/room/" + response.data.roomId + "")
            }

            
        })
    }

    //save captcha value to post into server
    const handleCaptcha = (value) => {
        setCaptchaValue(value)
    }

    return (
        <div className="container text-center ">
        <div className="container pb-4">
            <h1 className="display-3 d-none d-sm-inline text-wrap">Askaway</h1>
            <h1 className="display-4 d-sm-none text-wrap">Askaway</h1>

            <h4 className="">The free service that lets you ask anonymous questions live.</h4>
           <a href="readmore.html" id="" className="alert-link">Read more</a>

        </div>

        

        

        <div className="container w-sm-50">
            <input onChange={(e) => handleChange(e.target.value)} value={inputValue} id="codeInput" className="form-control text-center" type="text" placeholder="Type room code here to join"/>
            
            <div className="container d-flex flex-wrap justify-content-center mt-4">
                <ReCaptcha
                    sitekey="6LdqX4saAAAAAC3Cie6ilnn6ujzvKuiMm2tjYeWG"
                    onChange={handleCaptcha}
                    />
               
            </div>
            <span className="text-danger d-block">
                    {captchaWarning}
                </span>
            
                <button onClick={handleJoin} className="btn btn-primary px-4 m-4">{joinText}</button>
            
        </div>

        <div className="container">
            {/* <Link to={"/room/" + }> */}
                <button onClick={handleCreate} className="btn btn-link alert-link">{createText}</button>
            {/* </Link> */}
        </div>

        <PreviousRoom/>
    </div>
    )
}
