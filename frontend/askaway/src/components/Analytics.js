import React, {useEffect, useState} from 'react'
import ReCaptcha from "react-google-recaptcha"
import Axios from "axios"
import {address} from './serverAdress'

export default function Admin() {

   

    const [password, setPassword] = useState()
    const [captchaValue, setCaptchaValue] = useState()
    const [analData, setAnalData] = useState()
    const [allowed, setAllowed] = useState()


    const handleSubmit = () => {
        Axios.post(address + "/analytics", {password: password, captcha: captchaValue} )
        .then((response) => {
            setAnalData(response.data.data)
            setAllowed(response.data.success)
            console.log(response.data)
            resetCaptcha()
        })
    }

    const handleCaptcha = (value) => {
        setCaptchaValue(value)
    }
    
    let captcha

    const setCaptchaRef = (ref) => {
        if(ref){
            return captcha = ref;
        }
    }

    const resetCaptcha = () => {
        captcha.reset();
    }

    
    const handleReset = (value) => {
        // http://localhost:3001
        // https://askawayapp.herokuapp.com
        Axios.post(address + "/resetAnal", {password: password, captcha: captchaValue} )
        .then((response) => {
            
            console.log(response.data)
            setAnalData(
                [   
                    {
                        questions: 0,
                        rooms: 0,
                        users: 0,
                    }
                ]
            )
        })
    }

    return (
		<div>
         <ReCaptcha
                        sitekey="6LdqX4saAAAAAC3Cie6ilnn6ujzvKuiMm2tjYeWG"
                        onChange={handleCaptcha}
                        ref={(r) => setCaptchaRef(r)}
                    /> 
                    
            <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)}>

            </input>
            <button onClick={handleSubmit}>
                log in
            </button>

           {
               allowed == true &&
               <div>

                    <h3>
                        Total rooms: {analData[0].rooms}
                    </h3>

                    <h3>
                        Total questions: {analData[0].questions}
                    </h3>
                    <h3>
                        Total users: {analData[0].users}
                    </h3>

                    <h3>
                        -------------------
                    </h3>

                    <h3>
                        Average questions per room: {(analData[0].questions / analData[0].rooms).toFixed(2)}
                    </h3>
                    <h3>
                        Average users per room: {(analData[0].users / analData[0].rooms).toFixed(2)}
                    </h3>
                    <h3>
                        Average questions per user: {(analData[0].questions / analData[0].users).toFixed(2)}
                    </h3>
                    

                  
                    <button onClick={handleReset}>
                    Reset stats
                    </button>
               </div>
           }
            
		</div>
	);
}