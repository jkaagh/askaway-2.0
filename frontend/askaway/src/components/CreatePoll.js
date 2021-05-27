import React, {useState, useEffect, useRef} from "react"
import Axios from "axios"
import {io} from "socket.io-client"

export default function () {
    
    const [pollData, setPollData] = useState(
        [
            "",
            ""
        ]
    )

    const [pollTitle, setPollTitle] = useState("")
    const [, update] = useState()
    const [newInput, setNewInput] = useState("")
    const [pollInfo, setPollInfo] = useState("d-none")
    const [checkbox, setCheckbox] = useState(false)


    const socketRef = useRef()

    useEffect(() => {
		//connect to the server
		// socketRef.current = io.connect("https://askawayapp.herokuapp.com"); 
		socketRef.current = io.connect("http://localhost:3001"); 
		// socketRef.current.emit
		socketRef.current.on("pollUpdate", ({data}) => {
	
            //respond to new updates here
		});
	}, [])

    const handleDelete = (i) => {
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
        let newData = pollData;
        newData.push(newInput);
        setPollData(newData)
        setNewInput("")
        console.log(pollData)
    }

    const handlePost = () =>{
        console.log(pollData)
        socketRef.current.emit("postPoll", {pollData: pollData, pollTitle: pollTitle, checkbox: checkbox })
    }

    
    

    return(
        <div className="">
            <h4 className=" text-center m-auto">Create poll</h4>
            <p className="text-center">
                Create an anonymous poll for everyone to vote
            </p>
            <input className="form-control fw-bold" placeholder="Poll title" onChange={(e) => {setPollTitle(e.target.value)}}></input>
            {
                pollData && pollData.map((entry, index) => {
                    return(
                        <div className="input-group my-2" key={index}>   
                            <input placeholder={"Option " + (index +1)  } className="form-control" value={entry}  onChange={(e) => {
                               
                                // setPollData(pollData => pollData[index] = "test" ) 
                               
                                
                                let newData = [...pollData]
                                console.log(newData);
                                newData[index] = e.target.value
                                setPollData(newData)
                                
                                console.log(pollData)
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
            
            <div className="text-center">
                <div className="form-switch mb-3">
                    <input className="form-check-input " type="checkbox" value="" id="flexCheckDefault" onClick={(e) => {setCheckbox(e.target.checked)}}/>
                    <label className="form-check-label ps-2" htmlFor="flexCheckDefault" >
                        Lock poll 
                    </label>
                    <span 
                    onClick={() => {setPollInfo("")}} 
                    className="text-primary p-2" 
                    ><u>?</u></span>
                    
                </div>
                <p className={pollInfo}>
                    Locking the poll will prevent users who joins the room after the poll has been published from participating. 
                    Everyone can see the results.
                </p>

                <button onClick={handlePost} id="btnAskQuestion" className="btn btn-outline-primary mt-3 px-4" type="button">Publish!</button>
            </div>

            {/* <button onClick={() => {}}>asd</button> */}
        </div>
    )
}

