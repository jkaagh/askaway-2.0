import React, {useState, useEffect, useRef} from 'react'
import cookie from 'react-cookies'
import Axios from "axios"
import {io} from "socket.io-client"

//as soon as i load the room, check for user and admin password. do server calls dependant on which one i find.
//user only posts, admin can also request from server.
export default function Room(props) {

    const [roomId, setRoomId] = useState(props.match.params.id);
    const [userId, setUserId] = useState()
    const [message, setMessage] = useState("")
    const [inputValue, setInputValue] = useState("")
    const [classList, setClassList] = useState("")
    const [canPost, setCanPost] = useState(true)
    useEffect(() => {
        setUserId(cookie.load("userId" + roomId + ""))
        console.log(props)
    }, [])


    //socketio stuff
    const socketRef = useRef()

    useEffect(() => {
		//connect to the server
		socketRef.current = io.connect("http://localhost:3001"); 
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
            console.log(success, msg)
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
        console.log(password)
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
            <h3 className="pt-4">Room Code: {roomId}</h3>
            <h4 className="pb-4">Your ID: {userId}</h4>
            <textarea onChange={(e) => setInputValue(e.target.value)} value={inputValue} type="text" rows="5" maxLength="200" className="form-control" placeholder="Type your question here" aria-label="" aria-describedby="basic-addon1>" />
            
            <span className={classList}>
                {message}
            </span>

            <button onClick={handlePost} id="btnAskQuestion" className="btn btn-outline-primary mt-3 px-4" type="button">Ask away!</button>
           
        </div>
    </div>
    )
}
