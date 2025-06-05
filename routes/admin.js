const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const Customer = require("../models/customerModel");


// Dashboard Route
router.get('/dashboard', (req, res) => {
    res.render('layout', { body: 'admin/dashboard' });
});

// Get all customers
router.get('/customer/list', (req, res) => {
    res.render('layout', { body: 'admin/user/list_user' });
});

router.get('/number', (req, res) => {
    res.render('layout', { body: 'admin/number/list_number' });
});

module.exports = router;
