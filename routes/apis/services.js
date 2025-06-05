const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

router.get('/', async (req, res) => {
  const { country } = req.query; // Get country from query params

  try {
    console.log("Fetching services from API...");
    
    const response = await axios.get('https://api.smspva.com/activation/servicesprices', {
      headers: { apikey: process.env.API_KEY },
    });

    if (!response.data || !response.data.data) {
      console.error("Unexpected API response format:", response.data);
      return res.status(500).json({ success: false, message: "Invalid API response format" });
    }

    const allServices = response.data.data;
    console.log(`Total services received: ${allServices.length}`);

    // Filter services by country if a country is provided
    const filteredServices = country
      ? allServices.filter(service => service.country === country)
      : allServices;

    console.log(`Services after filtering for country (${country}): ${filteredServices.length}`);

    res.json({ success: true, services: filteredServices });
  } catch (error) {
    console.error("Error fetching services:", error.response?.data || error.message);

    let errorMessage = "Failed to fetch services";
    if (error.response) {
      // API responded with an error status
      errorMessage = error.response.data?.message || `API error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "No response from API";
    } else {
      // Something else happened
      errorMessage = error.message;
    }

    res.status(500).json({ success: false, message: errorMessage });
  }
});

module.exports = router;
