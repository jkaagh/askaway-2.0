import React from 'react'

export default function Room(props) {
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
