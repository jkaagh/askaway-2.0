import React, {useState, useEffect, useRef} from 'react'
import cookie from 'react-cookies'  
import {io} from "socket.io-client"
import CookieLaw from './CookieLaw';
import {address} from "./serverAdress"
import Poll from "./Poll"

//as soon as i load the room, check for user and admin password. do server calls dependant on which one i find.
//user only posts, admin can also request from server.
export default function Room(props) {

    
    

    const [roomId] = useState(props.match.params.id);
    const [userId, setUserId] = useState()
    const [message, setMessage] = useState("")
    const [inputValue, setInputValue] = useState("")
    const [classList, setClassList] = useState("")
    const [canPost, setCanPost] = useState(true)
    const [showPoll, setShowPoll] = useState()
    const [displayPoll, setDisplayPoll] = useState("d-none")

    const enablePoll = () => {
        setShowPoll("col-md-8")
        setDisplayPoll("")
    }
    useEffect(() => {
        setUserId(cookie.load("userId" + roomId + ""))
        
    }, [])


    //socketio stuff
    const socketRef = useRef()

    useEffect(() => {
		//connect to the server
		socketRef.current = io.connect(address); 
		// socketRef.current.emit
		socketRef.current.on("RoomMessage", ({ msg, success }) => {
			if (success === false) {
                setClassList("text-danger d-block")
				setMessage(msg);
			} else {
                setInputValue("");
                setClassList("text-primary d-block")
                setMessage(msg)
            }

		});
	}, [])



    const handlePost = () => {
        
        if(canPost) {

            setCanPost(false)

            //set timer
            setTimeout(() =>{

                setCanPost(true)
            }, 3000)
        }
        else{
            setClassList("text-danger d-block")
				setMessage("You can't post more than once every 3 seconds.");
                return
        }
       

        let password = cookie.load("userPassword" + roomId + "")
        
        socketRef.current.emit("postQuestion", {password: password, roomId: roomId, question: inputValue })

       

        // Axios.post("http://localhost:3001/postquestion/", {password: password, roomId: roomId, question: inputValue })
        // .then((response) =>{
        //     console.log(response.data)
        //     if(response.data.success === false){
        //         setMessage(response.data.msg)
        //     }
        //     else{
        //         setInputValue("")
        //     }
        // })
    }
    
    return (
        <div className="container text-center" id="QuestionsContainer">
            <div className="container">
                <h3 className="pt-4">Room Code: <u>{roomId}</u></h3>
                <h4 className="pb-4">Your ID: <u>{userId}</u></h4>
                    <div className="row">
                        <div className={"container-fluid border-right p-4 col-12 " + showPoll}>
                        <textarea 
                        onChange={(e) => setInputValue(e.target.value)} 
                        onKeyPress={(e) => {
                            if(e.key === "Enter"){
                                handlePost()
                                e.preventDefault();
                            }
                        }} 
                        value={inputValue} 
                        type="text" 
                        rows="5" 
                        maxLength="200" 
                        className="customInput form-control " 
                        placeholder="Type your question here"   
                        />
                    
                        <span className={classList}>
                            {message}
                        </span>

                        <button onClick={handlePost} id="btnAskQuestion" className="btn btn-outline-primary mt-3 px-4" type="button">Ask away!</button>
                    </div>
                   
                    <div className={ "container-fluid border-start p-4 col-12 col-md-4 order-first order-md-last " + displayPoll}>
                        <Poll roomId={roomId} parentFunction={enablePoll}/>
                        
                    </div>
                
                </div>



            
            </div>
            <CookieLaw/>
        </div>
    )
}
