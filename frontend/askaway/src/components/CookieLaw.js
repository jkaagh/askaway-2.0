import React, {useEffect, useState} from 'react'
import cookie from 'react-cookies'
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"

export default function CookieLaw() {
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        // let date = new Date()
        // let time = (Math.floor(new Date().getTime()/1000.0) + (60 * 60 * 24 * 365 * 10))
        // let d = new Date(time)
        // console.log(time)

        let d = new Date();
        let time = d.getTime()
        let tomorrow = time + 900000000000
        d = new Date(tomorrow);
        console.log(d)

        document.cookie = "AskawayCookiesAllowed=true; expires=" + d + ""
    } 
        
    

    useEffect(() => {
        if(cookie.load("AskawayCookiesAllowed") == null){
            
            setShow(true)
        }
    }, [])

    return (
		<div>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header>
					<Modal.Title>This site uses cookies.</Modal.Title>
				</Modal.Header>
				<Modal.Body>
                By continuing to use this site, you consent to using the following cookies:
                <li>
                    reCaptcha cookies by Google
                </li>
                <li>
                    Cookies by Askaway for running the site optimally.
                </li>
                
                
                </Modal.Body>
				<Modal.Footer>
					<Button onClick={handleClose} variant="primary">Okay</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}