// Define app using express
var express = require("express")
var app = express()
// Require database SCRIPT file
var db = require('./database.js')

// Require md5 MODULE
var md5 = require('md5')

// Make Express use its own built-in body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set server port
var HTTP_PORT = 5000

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
	// console.log('Your API is working!')
});
// READ (HTTP method GET) at root endpoint /app/
app.get("/app/", (req, res, next) => {
    res.json({"message":"Your API works! (200)"});
	res.status(200);
});

// Define other CRUD API endpoints using express.js and better-sqlite3  
// CREATE a new user (HTTP method POST) at endpoint /app/new/   
app.post("/app/new/", (req,res) => {
	const stmt = db.prepare("INSERT INTO userinfo (user, pass) VALUES (?, ?)")
	const add = stmt.run(req.body.user, md5(req.body.pass))
	res.status(201).json({"message": add.changes + " record created: ID " + add.lastInsertRowid + " (201)"})
})

// READ a list of all users (HTTP method GET) at endpoint /app/users/
app.get("/app/users", (req, res) => {	
	const stmt = db.prepare("SELECT * FROM userinfo").all();
	res.status(200).json(stmt);
});

// READ a single user (HTTP method GET) at endpoint /app/user/:id   
app.get("/app/user/:id", (req, res) => {
	const stmt = db.prepare("SELECT * FROM userinfo WHERE id=?")
	const one_user = stmt.get(req.params.id)
	res.status(200).json(one_user)
})

// UPDATE a single user (HTTP method PATCH) at endpoint /app/update/user/:id
app.patch("/app/update/user/:id", (req,res) => {
	const stmt = db.prepare("UPDATE userinfo SET user = COALESCE(?,user) pass = COALESCE(?,pass) WHERE id=?")
	const to_update = stmt.run(req.body.user, md5(req.body.pass), req.params.id)
	res.status(200).json({"message": to_update.changes + " record updated: ID " + req.params.id + " (200)"})
})

// DELETE a single user (HTTP method DELETE) at endpoint /app/delete/user/:id
app.delete("/app/delete/user/:id", (req,res) => {
	const stmt = db.prepare("DELETE FROM userinfo WHERE id =?")
	const to_delete = stmt.run(req.params.id)
	res.status(200).json({"message": to_delete.changes + " record deleted: ID " + req.params.id + " (200)"})
})

// Default response for any other request
app.use(function(req, res){
	res.json({"message":"Endpoint not found. (404)"});
    res.status(404);
});
