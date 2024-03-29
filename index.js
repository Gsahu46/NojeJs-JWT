const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { swaggerDocs, swaggerUi } = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'secret_key'; 


const users = [];

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));



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
 *     parameters:
 *        - in: query
 *          name: apiKey
 *          schema:
 *            type: string
 *          required: true
 *          description: Authentication key
 *     responses:
 *       '200':
 *         description: Welcome message for the authenticated user
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Welcome, [username]! This is a secure route."
 *       '401':
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

app.post('/logout', (req, res) => {
  res.send("Logged out successfully");
});


/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Fetch data with optional filtering
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter entries by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of entries returned
 *     responses:
 *       200:
 *         description: A list of entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Category:
 *                     type: string
 *                   # Add other properties as needed based on the actual data structure
 *       500:
 *         description: Internal Server Error
 */

app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get('https://api.publicapis.org/entries');

    const { entries } = response.data;

    let filteredData = entries;

    const { category } = req.query;
    if (category) {
      filteredData = filteredData.filter(entry => entry.Category.toLowerCase() === category.toLowerCase());
    }

    const { limit } = req.query;
    if (limit) {
      filteredData = filteredData.slice(0, parseInt(limit, 10));
    }

    res.json(filteredData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:${3000}/api-docs`);
});
