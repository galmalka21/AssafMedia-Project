const express = require('express');
const mysql = require('mysql');
const app = express();

// Connect to MySQL server
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'database'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server');
});

// Function to generate a random number between 1 and 6
function generateNumber() {
  return Math.floor(Math.random() * 6) + 1;
}

// Function to save three parameters to the database
function saveToDb(param1, param2, param3) {
  let sql = 'INSERT INTO tablename (col1, col2, col3) VALUES (?, ?, ?)';
  let values = [param1, param2, param3];
  connection.query(sql, values, (err, result) => {
    if (err) throw err;
    console.log('Data saved to database');
  });
}

// Middleware function to check for valid serial key before allowing connection
function checkKey(req, res, next) {
  let serialKey = req.header('Serial-Key');
  if (serialKey === 'valid_key') {
    next();
  } else {
    res.status(401).send('Invalid serial key');
  }
}

// Use middleware function on all routes
app.use(checkKey);

// Example route to generate a number and save it to the database
app.get('/generate', (req, res) => {
  let randomNum = generateNumber();
  saveToDb(randomNum, 'example_param2', 'example_param3');
  res.send(`Generated number: ${randomNum}`);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});