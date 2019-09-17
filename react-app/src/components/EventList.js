import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './EventList.css'

export default class EventList extends Component {
    constructor() {
        super();
        this.state = {
            events: [],
        }
    }
    componentDidMount() {
        fetch("https://beta.ckteo.xyz/api/event", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ID": "b5f2"
            }
        }).then(response => {
            return response.json()
        }).then(result => {
            this.setState({events: result.message})
        })
    }
    render() {
        return (
            <div className="eventList">
                {this.state.events.map(event =>
                    <div id={event.event_id} className="event">
                        <div className="details">
                            <h3>{event.event_name}</h3>
                            <p><i className="far fa-clock fa-fw"></i> {event.time}</p>
                            <p><i className="fas fa-map-marker-alt fa-fw"></i> {event.location}</p>
                        </div>
                        <Link to={"/event/"+event.event_id} className="more">
                            <i className="fas fa-chevron-right fa-2x"></i>
                        </Link>
                    </div>
                )}
            </div>
        )
    }
}
