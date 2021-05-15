import React, {useState, useEffect, useRef} from 'react'
import {io} from "socket.io-client"
import cookie from 'react-cookies'
import BanHammer from "../assets/hammer.svg"
import Axios from "axios"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"

// import { set } from 'mongoose';

export default function Room(props) {

    const [roomId] = useState(props.match.params.id);
    const [data, setData] = useState([])
    const [message, setMessage] = useState("")
    const [classList, setClassList] = useState("")
    const [userToBan, setUserToBan] = useState()
    
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

    
    const handleBanClick = (id) => {
        // do something related to a popup window here.
        setUserToBan(id)
        
        handleShow()
    }

    const handleBan = () => {
        handleClose()
        
        console.log(userToBan)
        
        Axios.post("http://localhost:3001/banuser/", {
            password: cookie.load("adminPassword" + roomId + ""),
            userId: userToBan,
            roomId: roomId
        }).then((response) =>{
            console.log(response)
            console.log(data)
            
            //im super lazy so just reset the thing instead of cleaning out the local array.
            socketRef.current.emit("adminValidate", {
                password: cookie.load("adminPassword" + roomId + ""),
                roomId: roomId,
            })
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
                                        <img alt="ban user" src={BanHammer}></img>
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
          <Modal.Title>Ban user?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to ban user '{userToBan}'? You will not recieve any questions and the user will not be notified. <b>This cannot be undone.</b></Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleBan}>
            Confirm
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
        </div>
    </div>
    )
}
