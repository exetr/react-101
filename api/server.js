#!/usr/bin/env node

require('dotenv').config();
require('console-stamp')(console, {pattern: 'dd/mm/yyyy HH:MM:ss'});
const express = require('express');
const app = express();
const cors = require('cors')
const crypto = require('crypto')
const util = require('util')
// const swagger = require('swagger-ui-express'), swaggerDoc = require('./swagger.json')

// DB Connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./events.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("[-] sqlite3: " + err.message)
    } else {
        console.log("[+] sqlite3: Connected to events database")
    }
})

// Configurations
const port = process.env.PORT
const ip = process.env.IP

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.post('/setup', (req,res) => {
    if(req.headers.auth === process.env.AUTH) {
        console.log("[*] POST /setup")
        //Prepare parameters
        let users = req.body.users
        let uid = []
        for(i=0; i<users; i++) {
            uid.push(randomHex(4))
        }
        let placeholders = uid.map((id) => '(?)').join(',')
        let sql_insert1 = "INSERT INTO users VALUES" + placeholders
        let sql_create1 = "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY);"
        let sql_create2 = `CREATE TABLE IF NOT EXISTS events (
            event_id INTEGER PRIMARY KEY,
            event_name TEXT NOT NULL,
            time TEXT NOT NULL,
            location TEXT NOT NULL,
            user_id TEXT NOT NULL
            );`

        // Create Users
        db.serialize(() => {
            db.run(sql_create1, (err) => {
                if (err) {
                    console.log("[-] Sqlite3: " + err.message)
                    return res.status(500).send({message: "500 Database Error"})
                }
            })
            db.run(sql_insert1, uid, (err) => {
                if (err) {
                    console.log("[-] Sqlite3: " + err.message)
                    return res.status(400).send({message: "400 Bad Request"})
                }
            })
            console.log("[+] "+users+" users created")
        })

        // Create Events
        db.run(sql_create2, (err) => {
            if (err) {
                console.log("[-] Sqlite3: " + err.message)
                return res.status(500).send({message: "500 Database Error"})
            }
        })
        console.log("[+] Setup Complete")
        return res.status(200).send({message: uid});
    } else {
        return res.status(403).send({message: "403 Unauthorized"})
    }
})

app.get('/event', (req,res) => {
    db.serialize(() => {
        db.get("SELECT * FROM users WHERE id = ?", req.headers.id, (err,row) => {
            if (err) {
                console.log("[-] Sqlite3: " + err.message)
                return res.status(500).send({message: "500 Database Error"})
            } else if(!row) {
                return res.status(403).send({message: "403 Unauthorized"})
            } else {
                console.log("[*] GET /event")
                let sql_select = "SELECT event_id, event_name, time, location FROM events WHERE user_id = ? ORDER BY time"
                let result = {}
                db.all(sql_select, req.headers.id, (err, rows) => {
                    let arr = []
                    rows.forEach((row) => {
                        var one = {}
                        one["event_id"] = row.event_id
                        one["event_name"] = row.event_name
                        one["time"] = row.time
                        one["location"] = row.location
                        arr.push(one)
                    })
                    res.status(200).send({ message: arr })
                })
            }
        })
    })
})

app.get('/event/:id', (req, res) => {
    db.serialize(() => {
        db.get("SELECT * FROM users WHERE id = ?", req.headers.id, (err,row) => {
            if (err) {
                console.log("[-] Sqlite3: " + err.message)
                return res.status(500).send({message: "500 Database Error"})
            } else if(!row) {
                return res.status(403).send({message: "403 Unauthorized"})
            } else {
                console.log("[*] GET /event/"+req.params.id)
                let sql_select = "SELECT * FROM events WHERE user_id = ? AND event_id=?"
                db.get(sql_select, [req.headers.id,req.params.id], (err, row) => {
                    var one = {}
                    if(row) {
                        one["event_id"] = row.event_id
                        one["event_name"] = row.event_name
                        one["time"] = row.time
                        one["location"] = row.location
                    }
                    return res.status(200).send({message: one})
                })
            }
        })
    })
})

app.post('/event', (req,res) => {
    db.serialize(() => {
        db.get("SELECT * FROM users WHERE id = ?", req.headers.id, (err,row) => {
            if (err) {
                console.log("[-] Sqlite3: " + err.message)
                return res.status(500).send({message: "500 Database Error"})
            } else if (!row) {
                return res.status(403).send({message: "403 Unauthorized"})
            } else {
                console.log("[*] POST /event")
                let sql_insert="INSERT INTO events (event_name, time, location, user_id) VALUES (?,?,?,?)"
                let name = req.body.event_name
                let time = req.body.time
                let location = req.body.location
                let id = req.headers.id
                if(!name || !time || !location || !id) {
                    return res.status(400).send({message: "400 Bad Request"})
                } else {
                    db.run(sql_insert, [name, time, location, id], (err) => {
                        if (err) {
                            console.log("[-] Sqlite3: " + err.message)
                            return res.status(500).send({message: "500 Database Error"})
                        } else {
                            console.log("[+] 1 Row Inserted")
                            return res.status(200).send({message: "200 OK"})
                        }
                    })
                }
            }
        })
    })
})

app.patch('/event/:id', (req,res) => {
    db.serialize(() => {
        db.get("SELECT * FROM users WHERE id = ?", req.headers.id, (err,row) => {
            if (err) {
                console.log("[-] Sqlite3: " + err.message)
                return res.status(500).send({message: "500 Database Error"})
            } else if (!row) {
                return res.status(403).send({message: "403 Unauthorized"})
            } else {
                console.log("[*] PATCH /event")
                let sql_update="UPDATE events SET event_name=?, time=?, location=? WHERE event_id=?"
                let name = req.body.event_name
                let time = req.body.time
                let location = req.body.location
                let id = req.params.id
                if(!name || !time || !location || !id) {
                    return res.status(400).send({message: "400 Bad Request"})
                } else {
                    db.run(sql_update, [name, time, location], (err) => {
                        if (err) {
                            console.log("[-] Sqlite3: " + err.message)
                            return res.status(500).send({message: "500 Database Error"})
                        } else {
                            console.log("[+] 1 Row Updated")
                            return res.status(200).send({message: "200 OK"})
                        }
                    })
                }
            }
        })
    })
})

app.delete('/event/:id', (req,res) => {
    db.serialize(() => {
        db.get("SELECT * FROM users WHERE id = ?", req.headers.id, (err,row) => {
            if (err) {
                console.log("[-] Sqlite3: " + err.message)
                return res.status(500).send({message: "500 Database Error"})
            } else if (!row) {
                return res.status(403).send({message: "403 Unauthorized"})
            } else {
                console.log("[*] DELETE /event")
                let sql_delete = "DELETE FROM events WHERE event_id = ?"
                db.run(sql_delete, req.params.id, (err) => {
                    if (err) {
                        console.log("[-] Sqlite3: " + err.message)
                        return res.status(500).send({message: "500 Database Error"})
                    } else {
                        console.log("[+] 1 Row Deleted")
                        return res.status(200).send({message: "200 OK"})
                    }
                })
            }
        })
    })
})

app.listen(port, ip, function() {
    console.log("[*] Server started at "+ip+" on port "+port)
})


function randomHex(len) {
    return crypto
        .randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len)
}
