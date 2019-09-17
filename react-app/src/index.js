import React from 'react';
import ReactDOM from 'react-dom';
import EventList from './components/EventList'
import './components/style.css'
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import AddEvent from './components/AddEvent';
import OneEvent from './components/OneEvent';

// export default class Index extends React.Component {
//     render() {
//         return (
//             <div>
//                 <header>
//                     <a href="/" className="link-home"><h1>Events</h1></a>
//                     <a href="/add" className="add-btn"><span>Add </span><i className="far fa-calendar-plus"></i></a>
//                 </header>
//                 <EventList />
//             </div>
//         )
//     }
// }
// ReactDOM.render(<Index/>, document.getElementById('root')); 

//Routing
const route = (
    <Router>
        <div>
            <header>
                <Link to="/" className="link-home"><h1>Events</h1></Link>
                <Link to="/add" className="add-btn"><span>Add </span><i className="far fa-calendar-plus"></i></Link>
            </header>
            <Route exact path="/" component={EventList} />
            <Route path="/add" component={AddEvent} />
            <Route path="/event/:id" component={OneEvent} />
        </div>
    </Router>
)
ReactDOM.render(route, document.getElementById('root'))