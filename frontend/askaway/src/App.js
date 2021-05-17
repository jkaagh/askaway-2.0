import React from "react"
import {Route, Switch} from 'react-router-dom'
import Home from "./components/Home"
import Room from "./components/Room"
import Host from "./components/Host"
import ReadMore from "./components/ReadMore"
function App() {
  return (
    <div className="App">
        <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/room/:id" component={Room}/>
            <Route path="/host/:id" component={Host}/>
            <Route path="/readmore/" component={ReadMore}/>
        </Switch>
    </div>
  );
}

export default App;
