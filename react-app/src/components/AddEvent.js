import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import './AddEvent.css'

export default class AddEvent extends Component {
    constructor() {
        super();
        this.submitForm = this.submitForm.bind(this);
        this.state = {
            "redirect": false
        }
    }

    submitForm(event) {
        event.preventDefault();
        let data = {}
        data.event_name = document.getElementById('event_name').value
        data.time = document.getElementById('time').value
        data.location = document.getElementById('location').value
        fetch("https://beta.ckteo.xyz/api/event", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "ID":"b5f2"
            },
            body: JSON.stringify(data)
        }).then(() => {
            this.setState({"redirect": true})
        })
    }

    renderRedirect() {
        const redirect = this.state.redirect;
        if(redirect) {
            return <Redirect to="/" />
        }
    }

    render() {
        return (
            <div className="eventInfo">
                {this.renderRedirect()}
                <h2>Add New Event</h2>
                <div className="form">
                    <div className="input-group">
                        <span className="fa-stack fa-1x fa-fw icon">
                            <i className="far fa-circle fa-stack-2x"></i>
                            <i className="fas fa-tag fa-stack-1x"></i>
                        </span>
                        <input id="event_name" className="form-input" type="text" placeholder="Event Name"></input>
                    </div>
                    <div className="input-group">
                        <span className="fa-stack fa-1x fa-fw icon">
                            <i className="far fa-circle fa-stack-2x"></i>
                            <i className="fas fa-calendar-alt fa-stack-1x"></i>
                        </span>
                        <input id="time" className="form-input" type="text" placeholder="Date"></input>
                    </div>
                    <div className="input-group">
                        <span className="fa-stack fa-1x fa-fw icon">
                            <i className="far fa-circle fa-stack-2x"></i>
                            <i className="fas fa-map-marker-alt fa-stack-1x"></i>
                        </span>
                        <input id="location" className="form-input" type="text" placeholder="Location"></input>
                    </div>
                </div>
                <div className="btn">
                    <button className="btn-submit" onClick={this.submitForm}>Submit</button>
                </div>
            </div>
        )
    }
}
