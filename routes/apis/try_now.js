const express = require('express');
require('dotenv').config();
const router = express.Router();

const API_BASE_URL = "https://temp-number-api.com/test/api/v1/activation";
const API_TOKEN = process.env.API_TOKEN;

// Fetch available services (Step 1)
router.get('/services', async (req, res) => {
    try {
        console.log("Fetching services from external API...");

        const response = await fetch(`${API_BASE_URL}/services`, {
            method: 'GET',
            headers: {
                'x-api-key': API_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // Log the error response
            console.error("API Error Response:", errorText);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched services successfully:", data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services', details: error.message });
    }
});
// Fetch available countries for a selected service (Step 2)
router.get('/countries', async (req, res) => {
    const { service_id } = req.query; // Get selected service from query

    if (!service_id) {
        return res.status(400).json({ error: 'Service ID is required' });
    }

    try {
        console.log(`Fetching countries for service ID: ${service_id}`);

        const response = await fetch(`${API_BASE_URL}/prices/services?service=${service_id}`, {
            method: 'GET',
            headers: {
                'x-api-key': API_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(`Fetched countries for service ${service_id}:`, data);

        // Extract the countries array for the selected service
        const selectedService = data.find(service => service.service_id === service_id);
        if (!selectedService || !selectedService.countries) {
            return res.status(404).json({ error: 'No countries found for this service' });
        }

        res.json(selectedService.countries); // Return only the countries array
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries', details: error.message });
    }
});

// Middleware to check if the user is logged in
function ensureAuthenticated(req, res, next) {
    console.log("Session data:", req.session); // Debugging
    console.log("Session user:", req.session.user); // Debugging
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

// Proceed to Payment Route
router.get("/proceed-to-payment", ensureAuthenticated, (req, res) => {
    res.render("pages/payment");
});
module.exports = router;