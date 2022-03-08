import React, {useEffect, useState} from 'react'
import cookie from 'react-cookies'
import {useHistory} from "react-router-dom"

export default function PreviousRoom() {
    let history = useHistory();
    let prevRoomCookie
    const [data, setData] = useState()
    
    
    useEffect(() => {
        prevRoomCookie = cookie.load("PreviousRoom")
        if(prevRoomCookie === undefined){
            return null
        }
        else{
            setData(
                <div>
                    <div className="container">
                        <p className="mt-4 mb-0">
                            It looks like you already created room {prevRoomCookie}
                        </p>
                        <button onClick={handleJoin} className="btn btn-link alert-link">Join {prevRoomCookie} as host</button>
           
                    </div>
                </div>
            )
            return ( //where does this return to?
                <div className="bg-danger">
                    ass
                </div>
            )
        }
    }, [])

    const handleJoin = () => {
        history.push("/host/" + prevRoomCookie + "")
    }

    return (
        <div>
            {data}
        </div>
    )
}
