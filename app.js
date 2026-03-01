const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Vulnerable database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password123",
  database: "userdb",
});

// Vulnerable JWT implementation
const createToken = (user) => {
  return jwt.sign(user, "hardcoded-secret");
};

// SQL Injection vulnerability
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    const token = createToken({ username });
    res.json({ token });
  });
});

// Path traversal vulnerability
app.get("/download", (req, res) => {
  const fileName = req.query.file;
  res.sendFile(fileName);
});

// Command injection vulnerability
app.get("/ping", (req, res) => {
  const host = req.query.host;
  const exec = require("child_process").exec;
  exec(`ping -c 4 ${host}`, (error, stdout) => {
    res.send(stdout);
  });
});

app.listen(3000, () => console.log("Server running"));
