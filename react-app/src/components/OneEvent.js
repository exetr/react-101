import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import './OneEvent.css'

export default class OneEvent extends Component {
    constructor() {
        super()
        this.deleteEvent = this.deleteEvent.bind(this);
        this.state = {
            "event": {},
            "event_id": null,
            redirect: false
        }
    }

    deleteEvent() {
        fetch("https://beta.ckteo.xyz/api/event/"+this.state.event_id, {
            method: "DELETE",
            headers: {
                "Content-Type":"application/json",
                "ID":"0000"
            }
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

    componentDidMount() {
        const { params } = this.props.match
        this.setState({'event_id': params.id})
        fetch("https://beta.ckteo.xyz/api/event/"+params.id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ID": "0000"
            }
        }).then(response => {
            return response.json()
        }).then(result => {
            this.setState({event: result.message})
        })
    }

    render() {
        return (
            <div className="one-event">
                {this.renderRedirect()}
                <p className="title">{this.state.event.event_name}</p>
                <div className="details">
                    <p>{this.state.event.time}</p>
                    <p className="at">at</p>
                    <p>{this.state.event.location}</p>
                </div>
                <div className="nav">
                    <Link to="/" className="btn-nav" id="back">
                        <i className="fas fa-chevron-left fa-fw"></i> Back
                    </Link>
                    <button onClick={this.deleteEvent} className="btn-nav" id="delete">
                        Delete <i className="far fa-trash-alt fa-fw"></i>
                    </button>
                </div>
            </div>
        )
    }
}
