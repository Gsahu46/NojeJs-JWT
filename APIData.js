const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Endpoint to fetch data with filtering options
app.get('/api/data', async (req, res) => {
  try {
    // Fetch data from the public API
    const response = await axios.get('https://api.publicapis.org/entries');

    // Extract data from the response
    const { entries } = response.data;

    // Apply filtering based on query parameters
    let filteredData = entries;

    // Filter by category if provided
    const { category } = req.query;
    if (category) {
      filteredData = filteredData.filter(entry => entry.Category.toLowerCase() === category.toLowerCase());
    }

    // Limit results if limit query parameter provided
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(3000, () => {
  console.log(`Server is running on http://localhost:${3000}`);
});
