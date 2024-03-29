const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { swaggerDocs, swaggerUi } = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'secret_key'; // Change this with your own secret key

// Sample database for users
const users = [];

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


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



/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username and password are required
 */
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


/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user and return an access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *     responses:
 *       200:
 *         description: Access token returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the authenticated user.
 *       401:
 *         description: Invalid username or password
 */
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


/**
 * @swagger
 * /secure:
 *   get:
 *     summary: Access a secure route
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome message for the authenticated user
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Welcome, [username]! This is a secure route."
 *       401:
 *         description: Unauthorized
 */
// Secure route 
app.get('/secure', authenticateToken, (req, res) => {
  res.send(`Welcome, ${req.user.username}! This is a secure route.`);
});


/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
// Logout endpoint 
app.post('/logout', (req, res) => {
  // Implement logout logic if needed (e.g., token invalidation)
  res.send("Logged out successfully");
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:${3000}`);
});
