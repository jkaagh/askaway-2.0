import React, {useState} from 'react'
import {Link} from "react-router-dom"
import Axios from "axios"
import ReCaptcha from "react-google-recaptcha"

export default function Home() {

    const [inputValue, setInputValue] = useState()
    const [createText, setCreateText] = useState("Or create a room...")
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
            console.log(response.data)

            
            //redirect to subpage todo
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
            <Link to={"/room/" + inputValue}> 
                <button className="btn btn-primary px-4 m-4">Join</button>
            </Link>
        </div>

        <div className="container">
            {/* <Link to={"/room/" + }> */}
                <button onClick={handleCreate} className="btn btn-link alert-link">{createText}</button>
            {/* </Link> */}
        </div>
    </div>
    )
}
