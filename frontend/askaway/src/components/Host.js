import React, {useState, useEffect, useRef} from 'react'
import {io} from "socket.io-client"
import cookie from 'react-cookies'
import BanHammer from "../assets/hammer.svg"
import Axios from "axios"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import closeButton from "react-bootstrap/closeButton"

// import { set } from 'mongoose';

export default function Room(props) {

    const [roomId, setRoomId] = useState(props.match.params.id);
    const [data, setData] = useState([])
    const [message, setMessage] = useState("")
    const [classList, setClassList] = useState("")
    
    const socketRef = useRef()


    //socketio stuff

    useEffect(() => {
        //connect to the server
        socketRef.current = io.connect("http://localhost:3001") //hvad er .current?
        

        //sends on startup to validate a few things.
        socketRef.current.emit("adminValidate", {
            password: cookie.load("adminPassword" + roomId + ""),
            roomId: roomId,
        })
        
        //general messages.
        socketRef.current.on("message", ({success, msg}) => {
            setMessage(msg)
            setClassList("text-danger d-block")
        })


        // on refresh/startup, get list from server.
        socketRef.current.on("QuestionList", ({ questionList }) => {
			
            console.log(questionList)
            setData(questionList)
		});

        //when recieve a single question emitted from client poster.
        socketRef.current.on("SingleQuestion", ({question, userId}) => {
            let newQuestion = {
                question: question,
                userId: userId,
            }
            setData((oldArray) => [...oldArray, newQuestion])
        });
        
    }, [])

    
    const handleBanClick = () => {
        // do something related to a popup window here.
       handleShow()
    }

    const handleBan = (id) => {
        console.log(id)
        Axios.post("http://localhost:3001/banuser/", {
            password: cookie.load("adminPassword" + roomId + ""),
            userId: id
        })
        .then((response) =>{
            console.log(response.data)
            if(response.data.success === false){
                setMessage(response.data.msg)
            }
            else{
                // setInputValue("")
            }
        })
    }
    
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    return (
        <div className="container " id="QuestionsContainer">
        <div className="container">
            <h3 className="pt-4 text-center ">Room Code: {props.match.params.id}</h3>
            <table className="table table-striped table-bordered text-left">
                <tbody id="tableBody">
                    <tr>
                        <th className="text-center"width="50px">#</th>
                        <th className="text-center" width="50px">ID</th>
                        <th className="px-3">Question</th>
                        <th className="text-center" width="50px">Ban</th>
                    </tr>
                    {data && data.map((question, index) => {
                        return(
                            <tr key={index}>
                                <td className="text-center"> {index + 1}</td>
                                <td className="text-center">{question.userId}</td>
                                <td className="text-left px-3">{question.question}</td>
                                <td onClick={() => handleBanClick(question.userId)} className="text-center">
                                    <div>
                                        <img src={BanHammer}></img>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="text-center">
                <span className={classList}>
                    {message}
                </span>
            </div>

            <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
        </div>
    </div>
    )
}
