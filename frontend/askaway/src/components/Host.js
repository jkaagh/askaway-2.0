import React, {useState, useEffect, useRef} from 'react'
import io from "socket.io-client"
export default function Room(props) {

    const [roomId, setRoomId] = useState(props.match.params.id);

    const socketRef = useRef();
	// const socket = io("")
	const socket = io("ws://localhost:3001", {
		withCredentials: true,
		extraHeaders: {
			"my-custom-header": "abcd",
		},
	});

    useEffect(() => {
        // connect to the server
        // socketRef.current = io.connect("http://localhost:3001/") //hvad er .current?
        // console.log("ass")
    }, [])
    
    
    return (
        <div className="container text-center" id="QuestionsContainer">
        <div className="container">
            <h3 className="pt-4">Room Code: {props.match.params.id}</h3>
            <h4 className="pb-4">Your ID: TODO</h4>
            <table className="table table-striped table-bordered text-left">
                <tbody id="tableBody">
                    <tr>
                        <th width="50px">#</th>
                        <th width="50px">ID</th>
                        <th >Question</th>
                    </tr>
                    {/* <!-- <div id="tableQuestions">
                        <tr>
                            <td>asd</td>
                            <td>asd</td>
                            <td>asdsasda</td>
                        </tr>
                    </div> --> */}
                </tbody>
            </table>

            <div className="input-group mb-3">

                <button id="btnAskQuestion" className="btn btn-outline-primary" type="button">Ask away!</button>

                <input id="inputAskQuestion" type="text" className="form-control" placeholder="Type your question here" aria-label="" aria-describedby="basic-addon1>" />
            </div>
        </div>
    </div>
    )
}
