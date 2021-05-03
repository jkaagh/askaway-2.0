import React, {useState, useEffect, useRef} from 'react'
import {io} from "socket.io-client"
import cookie from 'react-cookies'

export default function Room(props) {

    const [roomId, setRoomId] = useState(props.match.params.id);
    const [data, setData] = useState()

    const socketRef = useRef()

    useEffect(() => {
        //connect to the server
        socketRef.current = io.connect("http://localhost:3001") //hvad er .current?
        // socketRef.current.emit
        socketRef.current.on("QuestionList", ({ questionList }) => {
			
            console.log(questionList)
            setData(questionList)
		});
        socketRef.current.on("SingleQuestion", ({question}) => {
            console.log(question) //todo this is never recieved.
        });
        
    }, [])

    //socketio stuff



    const test = () =>{
        console.log(roomId)
        socketRef.current.emit("adminValidate", {
            password: cookie.load("adminPassword" + roomId + ""),
            roomId: roomId,
        })
    }
    
    
    
    return (
        <div className="container " id="QuestionsContainer">
        <div className="container">
            <h3 className="pt-4 text-center ">Room Code: {props.match.params.id}</h3>
            <h4 className="pb-4 text-center">Your ID: TODO</h4>
            <table className="table table-striped table-bordered text-left">
                <tbody id="tableBody">
                    <tr>
                        <th className="text-center"width="50px">#</th>
                        <th className="text-center" width="50px">ID</th>
                        <th className="px-3">Question</th>
                    </tr>
                    {/* <!-- <div id="tableQuestions">
                        <tr>
                            <td>asd</td>
                            <td>asd</td>
                            <td>asdsasda</td>
                        </tr>
                    </div> --> */}
                    {data && data.map((question, index) => {
                        return(
                            // <div key={index}>
                                
                            // </div>
                        <tr key={index}>
                            <td className="text-center"> {index + 1}</td>
                            <td className="text-center">{question.userId}</td>
                            <td className="text-left px-3">{question.question}</td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="input-group mb-3">

                <button id="btnAskQuestion" className="btn btn-outline-primary" type="button" onClick={test}>Ask away!</button>

                <input id="inputAskQuestion" type="text" className="form-control" placeholder="Type your question here" aria-label="" aria-describedby="basic-addon1>" />
            </div>
        </div>
    </div>
    )
}
