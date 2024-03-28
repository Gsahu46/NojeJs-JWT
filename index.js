const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'secret_key'; 

// Sample database for users
const users = [];

app.use(bodyParser.json());

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User registration endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }
  
  const user = { username, password };
  users.push(user);
  res.status(201).send("User registered successfully");
});

// User login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).send("Invalid username or password");
  }
  
  const accessToken = jwt.sign({ username: user.username }, SECRET_KEY);
  res.json({ accessToken });
});

// Secure route 
app.get('/secure', authenticateToken, (req, res) => {
  res.send(`Welcome, ${req.user.username}! This is a secure route.`);
});

// Logout endpoint 
app.post('/logout', (req, res) => {
  // Implement logout logic if needed (e.g., token invalidation)
  res.send("Logged out successfully");
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:${3000}`);
});
