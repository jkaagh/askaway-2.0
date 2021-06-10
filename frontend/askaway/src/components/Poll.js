import React, {useState, useEffect, useRef} from 'react'
import cookie from 'react-cookies'  
import {io} from "socket.io-client"
import {address} from "./serverAdress"

export default function Poll(props) {

    const [showPoll, setShowPoll] = useState(false) 
    const [pollTitle, setPollTitle] = useState("")
    const [pollData, setPollData] = useState([])
    const [totalVotes, setTotalVotes] = useState(0);
    const [selected, setSelected] = useState(-1); 
    const [toBeSelected, setToBeSelected] = useState()

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

            if(data.pollData != undefined){
                setPollData(data.pollData)
            }

            if(data.selected != undefined){
                setSelected(data.selected)
            }

            if(data.pollTitle != undefined){
                setShowPoll(true)
                setPollTitle(data.pollTitle)
                props.parentFunction()
            }
            
        })

        

        //in case device disconnects, such as when a phone leaves?/closes a browser or closing your laptop.
        socketRef.current.on("disconnect", () => {
            window.location.reload(true)
        })

     }, [])

    useEffect(() => { //this runs every time new polldata is recieved.
       let number = 0;
       pollData.forEach((item) => {
           number = item.value + number
       })  
       setTotalVotes(number);
    }, [pollData])

    const handleSubmit = (index) => {
        let password = cookie.load("userPassword" + props.roomId + "")
        socketRef.current.emit("sendPollAnswer", {choice: index, password: password})
        setToBeSelected(index)

    }
    return (
        <div className="">
            { showPoll &&
                <div>
                    <h4 className=" text-center m-auto">{pollTitle}</h4>
                    {pollData && pollData.map((item, index) => {
                        {/* console.log(item.value, totalVotes) */}
                        let number = Math.round(item.value / totalVotes * 100)
                        {/* if(number == 99){
                            number = 100;   
                        } */}
                        if(totalVotes == 0){
                            number = 0;
                        }
                        let enableBorder;
                        if(index === selected){
                            enableBorder = "border-primary"
                        }

                        return(
                            <div key={index} className="mb-1">
                                <div 
                                className={"border rounded p-1 " + enableBorder} 
                                style={{background: "linear-gradient(90deg, rgba(181,181,181,0.3) " + number + "%, rgba(255,0,10,0) " + number + "%)"}}
                                onClick={() => {handleSubmit(index)}}
                                >

                                   
                                    <div className="row">
                                        <div className="col-9 text-start">
                                            {item.option}
                                        </div>
                                        <div className="col-3 text-end">

                                           {number}%
                                            
                                        </div>
                                    </div>
                                   
                                </div>
                                
                            </div>
                        )
                    })
                        
                    }
                </div>
            }

            
           

            
        </div>
    )
}
