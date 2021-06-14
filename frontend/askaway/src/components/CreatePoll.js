import React, {useState, useEffect, useRef} from "react"
import Axios from "axios"
import {io} from "socket.io-client"
import {address} from "./serverAdress"
import cookie from 'react-cookies'

export default function (props) {
    
    const [pollData, setPollData] = useState(
        [
            "",
            ""
        ]
    )

    const [pollTitle, setPollTitle]         = useState("")
    const [, update]                        = useState()
    const [newInput, setNewInput]           = useState("")
    const [pollInfo, setPollInfo]           = useState("d-none")
    const [message, setMessage]             = useState()
    const [messageClass, SetMessageClass]   = useState()
    

    
    
    const socketRef = useRef()

    useEffect(() => {
		//connect to the server
		 
		socketRef.current = io.connect(address); 
		// socketRef.current.emit
		socketRef.current.on("pollUpdate", ({data}) => {
	
            //respond to new answers here
		});

        socketRef.current.on("message", (data) => {
            console.log(data)
            
            if(data.success !== true){
                
                setMessage(data.msg)
                SetMessageClass("text-danger")
                return
            }
            console.log("asd")
            props.onPost()

        })

       
	}, [])

    const handleDelete = (i) => {
        if(pollData.length < 3){
            setMessage("You need at least 2 options.")
            SetMessageClass("text-danger")
            return 
        }
        let newData = pollData
        newData.splice(i, 1)
        setPollData(newData)
        console.log(pollData)
        update({})
    }

    const handleAddNew = () => {
        if(newInput == ""){
            return;
        }
        if(pollData.length > 9){
            setMessage("You can max have 10 options.")
            SetMessageClass("text-danger")
            return 
        }
        let newData = pollData;
        newData.push(newInput);
        setPollData(newData)
        setNewInput("")
        console.log(pollData)
    }

    const handlePost = () =>{
        //frontend validation:
        let stop
        pollData.forEach((option) => {
            if(option == ""){
                setMessage("No options can be empty.")
                SetMessageClass("text-danger")
                stop = true
                return
            }
           
        })
        
        if(stop) return
        props.onPost()
        
        socketRef.current.emit("postPoll", {pollData: pollData, pollTitle: pollTitle, password: cookie.load("adminPassword" + props.roomId + ""), })
    }

    
    

    return(
        <div className="">
            <h4 className=" text-center m-auto">Create poll</h4>
            <p className="text-center">
                Create an anonymous poll for everyone to vote
            </p>
            <input className="form-control fw-bold" placeholder="Poll title" maxLength="50" onChange={(e) => {setPollTitle(e.target.value)}}></input>
            {
                pollData && pollData.map((entry, index) => {
                    return(
                        <div className="input-group my-2" key={index}>   
                            <input placeholder={"Option " + (index +1)  } maxLength="50" className="form-control" value={entry}  onChange={(e) => {
                               
                                // setPollData(pollData => pollData[index] = "test" ) 
                               
                                
                                let newData = [...pollData]
                               
                                newData[index] = e.target.value
                                setPollData(newData)
                                
                                
                            }}></input>
                            <button style={{width: "38px"}} tabIndex="-1" className="btn btn-outline-danger" onClick={
                                () => handleDelete(index)
                            }>
                                X
                            </button>
                        </div>
                    )
                })

            }
            <div className="input-group mb-2">   

                <input placeholder="Add new" className="form-control" 
                onChange={(e) => {setNewInput(e.target.value)}} 
                onKeyPress={(e) => {
                    if(e.key === "Enter"){
                        handleAddNew()
                    }
                }}
                value={newInput}
                ></input>

                <button style={{width: "38px"}} tabIndex="-1" className="btn btn-outline-primary p-0" onClick={handleAddNew}>
                   
                    <svg  viewBox="0 0 40 40">
                        <rect
                        x="19" y="14" // 12 px (+2 because not pixel perfect???)
                        width="2" height="12"
                        fill="currentColor"
                        />
                        <rect
                        x="14" y="19"
                        width="12" height="2"
                        fill="currentColor"
                        />
                    </svg>
                </button>

            </div>

            <div className={"text-center " + messageClass}>
                {message}
            </div>
            
            <div className="text-center">
                <button onClick={handlePost} id="btnAskQuestion" className="btn btn-outline-primary mt-3 px-4" type="button">Publish!</button>
            </div>

            {/* <button onClick={() => {}}>asd</button> */}
        </div>
    )
}

