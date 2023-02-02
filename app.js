const express = require('express');
const https = require("https");
const fs = require("fs");
const moment = require('moment');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const ip = require('ip');

const app = express()

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later"
});

const messages = ['הודעה' , 'הודעה1' , 'הודעה3' , 'הודעה4' , 'הודעה5']

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'mydb'
});

db.connect((err) => {
  if(err){
    throw err
  }
  console.log("MySql Connected")
})

app.post('*',limiter);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/html/index.html');
});

app.get('/admin', (req , res) => {
  res.sendFile(__dirname + '/frontend/html/admin.html')
})

app.get('/message', (req , res) => {
  var randomIndex = Math.floor(Math.random() * messages.length)
  var randomMessage = messages[randomIndex]
  res.send(randomMessage)
})

app.post('/save', (req, res) => {
  let description = req.body.description
  let won = req.body.won
  let ip_address = ip.address();
  let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  //Sql injections
  if(validateData(description,won)){
    db.query(`INSERT INTO actions (ip_address, action, timestamp, winrate) VALUES (?, ?, ? , ?)`, [ip_address, description, timestamp, won],
    (err, result) => {
        if (err) {
          console.log(err.message);
          res.send({ status: 'failure' });
        } else {
          console.log("record inserted");
          res.send({ status: 'success' });
        }
      });
  } else {
    res.send({status: 'failure, unknown data'})
  }
  
});

app.get('/load', (req,res) => {
  db.query('SELECT * FROM actions' , (err , result) => {
    if(err){
      console.log(err);
    } 
    else {
      
      res.send(result)
    }
  })
})

app.get('/load-user-data',(req,res) => {
  db.query('SELECT * FROM users_actions' , (err , result) => {
    if(err){
      console.log(err);
    } 
    else {
      res.send(result)
    }
  })
})

app.post('/save-user', (req,res) => {
  let username = req.body.username
  db.query(`INSERT INTO users (username) VALUES (?)`, [username]),
  (err, result) => {
    if(err) {
      console.log(err.message);
      res.send({status: 'failure'})
    } else {
      console.log('record inserted');
      res.send({status: 'success'})
    }
  }
})

app.post('/save-user-data', (req,res) => {
  let username = req.body.username
  let won = req.body.won
  username.toLowerCase()
  db.query('INSERT INTO users_actions (username , won) VALUES (? , ?) ',[username , won]),
  (err , result) => {
    if(err){
      console.log(err.message)
      res.send({status: 'failure'})
    } else {
      console.log('record inserted');
      res.send({status: 'success'})
    }
  }
})

app.get('/load-users', (req,res) => {
  db.query('SELECT * FROM users', (err , result) => {
    if(err){
      console.log(err);
    } else{
      res.send(result)
    }
  })
})

app.post('/admin-login', (req, res ) => {
  console.log("admin login");
  let username = req.body.username
  let password = req.body.password
  let hashFromDatabase
  console.log("Username: " + username + " , " + "Passowrd: " + password);
  db.query('SELECT username, password FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      bcrypt.compare(password, result[0].password, function(err, results) {
        if (results) {
          res.send({success: true, message: 'Login successful' });
        } else {
          res.send({success: false, message: 'Unauthorized: Invalid credentials' });
        }
    });
    }
    
  });
  console.log(hashFromDatabase);
  
})


//XSS
function validateData(description, won){
  let descValidate = false
  let wonValidate = false
  let accpetedDescription = ["player rolled 1 and stayed on the island" , "player rolled 2 and drunk bad rum" , "player rolled 2 and drunk good rum" , "player rolled 3 and lost to a dragon"
                            ,"player rolled 4 and found the treasure" , "player rolled 5 and found a message in a bottle" , "player rolled 6 and arrived to an island"]
  for(let i = 0 ; i < accpetedDescription.length ; ++i){
    if(accpetedDescription[i] == description){
      descValidate = true
      break
    } 
  }

  if(won == 1 || won == 0){
    wonValidate = true
  }

  if(descValidate && wonValidate){
    console.log("Valid Data")
    return true
  }
  return false
}


https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(3000, () => {
    console.log("serever is runing at port 3000");
  });

