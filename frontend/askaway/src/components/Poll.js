import React, {useState, useEffect, useRef} from 'react'
import cookie from 'react-cookies'  
import {io} from "socket.io-client"
import {address} from "./serverAdress"

export default function Poll(props) {

    const [showPoll, setShowPoll] = useState(false) 
    const [pollTitle, setPollTitle] = useState("")
    const [pollData, setPollData] = useState([])

     //socketio stuff
     const socketRef = useRef()

     useEffect(() => {
         //connect to the server
         socketRef.current = io.connect(address); 


         let password = cookie.load("userPassword" + props.roomId + "")
         socketRef.current.emit("setSocketId", {password: password})
         //sends nothing to the server 
         //to let the server know this client is part the room, with socketId.
 
         socketRef.current.on("SendPoll", (data) => {
             console.log(data)
             props.parentFunction()
             setPollTitle(data.pollTitle)
             setPollData(data.pollData)
             setShowPoll(true)
             
         })

         
     }, [])

    return (
        <div className="">
            { showPoll &&
                <div>
                    <h4 className=" text-center m-auto">{pollTitle}</h4>
                    {pollData && pollData.map((item, index) => {
                        return(
                            <div key={index}>
                                {item}asasd
                            </div>
                        )
                    })
                        
                    }
                </div>
            }

            
           

            
        </div>
    )
}
