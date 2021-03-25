import React, {useState, useEffect} from 'react'
import cookie from 'react-cookies'
import Axios from "axios"

//as soon as i load the room, check for user and admin password. do server calls dependant on which one i find.
//user only posts, admin can also request from server.
export default function Room(props) {

    const [roomId, setRoomId] = useState(props.match.params.id);
    const [userId, setUserId] = useState()
    const [message, setMessage] = useState("")
    const [inputValue, setInputValue] = useState("")
    useEffect(() => {
        setUserId(cookie.load("userId" + roomId + ""))
    }, [])

    const handlePost = () => {
        
        let password = cookie.load("userPassword" + roomId + "")
        Axios.post("http://localhost:3001/postquestion/", {password: password, roomId: roomId })
        .then((response) =>{
            console.log(response.data)
        })
    }
    
    return (
        <div className="container text-center" id="QuestionsContainer">
        <div className="container">
            <h3 className="pt-4">Room Code: {roomId}</h3>
            <h4 className="pb-4">Your ID: {userId}</h4>
            <textarea onChange={(e) => setInputValue(e.target.value)} type="text" rows="5" maxlength="200" className="form-control" placeholder="Type your question here" aria-label="" aria-describedby="basic-addon1>" />
            <button onClick={handlePost} id="btnAskQuestion" className="btn btn-outline-primary mt-3 px-4" type="button">Ask away!</button>
            {message}
        </div>
    </div>
    )
}
