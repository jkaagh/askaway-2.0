import React, {useState, useEffect, useRef} from "react"
import {io} from "socket.io-client"
import {address} from "./serverAdress"
import cookie from 'react-cookies'

export default function (props) {


    const [totalVotes, setTotalVotes] = useState(0);



     //socketio stuff
     const socketRef = useRef()

     useEffect(() => {
         //connect to the server
         socketRef.current = io.connect(address); 


         let password = cookie.load("AdminPassword" + props.roomId + "")
         socketRef.current.emit("setSocketIdHost", {password: password})
         //sends nothing to the server 
         //to let the server know this client is part the room, with socketId.
 
         
         
     }, [])

     useEffect(() => { //this runs every time new polldata is recieved.
        if(props.pollData === undefined) return
        let number = 0;
        props.pollData.forEach((item) => {
            number = item.value + number
        })  
        setTotalVotes(number);
     }, [props.pollData])
 
     

    return(
        <div>
        
        
        {props.pollData != undefined &&
            <div>
                <h4 className=" text-center m-auto">{props.pollTitle}</h4>
                {props.pollData && props.pollData.map((item, index) => {
                        // console.log(item.value, totalVotes)
                        let number = Math.round(item.value / totalVotes * 100)
                        {/* if(number == 99){
                            number = 100;   
                        } */}
                        let enableBorder;
                        if(index === props.selected){
                            enableBorder = "border-primary"
                        }

                        return(
                            <div key={index} className="mb-1">
                                <div 
                                className={"border rounded p-1 " + enableBorder} 
                                style={{background: "linear-gradient(90deg, rgba(181,181,181,0.3) " + number + "%, rgba(255,0,10,0) " + number + "%)"}}
                                onClick={() => {props.handleSubmit(index)}}
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