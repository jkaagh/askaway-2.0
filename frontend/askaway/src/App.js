import React from "react"
import {Route, Switch} from 'react-router-dom'
import Home from "./components/Home"
import Room from "./components/Room"

function App() {
  return (
    <div className="App">
        <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/room/:id" component={Room}/>
        </Switch>
    </div>
  );
}

export default App;
