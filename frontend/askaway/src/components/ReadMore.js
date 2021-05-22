import React from 'react'
import "../styles.css"
import CookieLaw from './CookieLaw'

export default function ReadMore() {
    return (
        <div className="container text-center">
        <a href="/" id="" className="alert-link">Go back</a>
            <h1 className="display-4">What is Askaway?</h1>
            <p className="readmoreText d-none d-sm-block">
                Askaway is a free to use service that lets you create your own room for everyone to ask you questions
                anonymously. 
            </p>
            <p className="d-sm-none">
                Askaway is a free to use service that lets you create your own room for everyone to ask you questions
                anonymously. 
            </p>
            <h5>
                But why?
            </h5>
            <p className="readmoreText d-none d-sm-block">
                Say you're hosting a presentation or a conference. Instead of everyone having to interrupt you with their questions, 
                they just send them via Askaway, and you can easily view them whenever you see fit. This way they wont forget their questions, and those who are
                uncomfortable speaking up can also ask.
                 <br/><br/> Each person has their own unique ID, in case
                anyone wants to be anonymous. <br/> <br/>
                
            </p>
            <p className="d-sm-none">
            Say you're hosting a presentation or a conference. Instead of everyone having to interrupt you with their questions, 
                they just send them via Askaway, and you can easily view them whenever you see fit. This way they wont forget their questions, and those who are
                uncomfortable speaking up can also ask.
                 <br/><br/> Each person has their own unique ID, in case
                anyone wants to be anonymous. <br/> <br/>
            </p>


            <h5>
                What about spammers or trolls?
            </h5>

            <p className="readmoreText d-none d-sm-block">

                As a room host, you have the ability to shadowban people. This means you won't see any of their questions, and they won't know they're banned.
                
            </p>
            <p className="d-sm-none">
                As a room host, you have the ability to shadowban people. This means you won't see any of their questions, and they won't know they're banned.
            
            </p>
            <CookieLaw/>
        </div>
    )
}
