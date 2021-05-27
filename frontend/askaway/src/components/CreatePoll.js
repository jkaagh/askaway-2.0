import React, {useState, useEffect} from "react"

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
    }

    

    return(
        <div className="">
            <h4 className=" text-center m-auto">Create poll</h4>
            <p className="text-center">
                Create an anonymous poll for everyone to vote
            </p>
            {
                pollData && pollData.map((entry, index) => {
                    return(
                        <div className="input-group mb-2" key={index}>   
                            <input placeholder={"Option " + index} className="form-control" value={entry}  onChange={(e) => {
                               
                                // setPollData(pollData => pollData[index] = "test" ) 
                               
                                
                                let newData = [...pollData]
                                console.log(newData);
                                newData[index] = e.target.value
                                setPollData(newData)
                                
                                console.log(pollData)
                            }}></input>
                            <button tabindex="-1" className="btn btn-outline-danger" onClick={
                                () => handleDelete(index)
                            }>
                                X
                            </button>
                        </div>
                    )
                })

            }
           
            <input placeholder="Add new" className="form-control" 
            onChange={(e) => {setNewInput(e.target.value)}} 
            onKeyPress={(e) => {
                if(e.key === "Enter"){
                    handleAddNew()
                }
            }}
            value={newInput}
            ></input>

            {/* <button onClick={() => {}}>asd</button> */}
        </div>
    )
}

