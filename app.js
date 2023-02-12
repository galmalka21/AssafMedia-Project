require('dotenv').config({ path: './secrets.env' });
const express = require('express');
const moment = require('moment');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const ip = require('ip');
const jwt = require('jsonwebtoken')
const {createTokens , validateToken} = require('./jwt')

const app = express()

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later"
});

app.use(cookieParser())
app.post('*',limiter);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'frontend')));

const messages = ['Leave the treasure , Wine dont u join me for a drink?' , 'הודעה1' , 'הודעה3' , 'הודעה4' , 'הודעה5']

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD
});

db.connect((err) => {
  if(err){
    throw err
  }
  console.log("MySql Connected")
})

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

app.get('/load', validateToken , (req,res) => {
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
  let userExists = false

  db.query(`SELECT * FROM users`, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      for (let i = 0; i < result.length; ++i) {
        if (username === result[i].username) {
          userExists = true
          res.send({ status: 'success' })
          break
        }
      }

      if (!userExists) {
        
        db.query(`INSERT INTO users (username) VALUES (?)`, [username], (err, result) => {
          if (err) {
            console.log(err.message)
            res.send({ status: 'failure' })
          } else {
            console.log('record inserted')
            res.send({ status: 'success' })
          }
        })
      }
    }
  })
  
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
  const {username , password} = req.body
  db.query('SELECT username, password FROM users WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      bcrypt.compare(password, result[0].password, function(err, results) {
        if (results) {
          const accessToken = createTokens(username)
          res.cookie("access-token", accessToken , {
            maxAge: 1000 * 60 * 1
          })
          res.send({success: true, message: 'Login successful' });
        } else {
          res.send({success: false, message: 'Unauthorized: Invalid credentials' });
        }
    });
    }
    
  });
  
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


app.listen(3000, () => {
    console.log("serever is runing at port 3000");
  });

