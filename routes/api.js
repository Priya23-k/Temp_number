const express = require('express');
const router = express.Router();

const servicesRouter = require('./apis/services'); // Looks for "services.js"
const countriesRouter = require('./apis/countries');
const PaymentRouter = require('./apis/payment');
const historyRouter = require('./apis/history');
const transactionsRouter = require('./apis/transactions');
const activationRouter = require('./apis/activation');

router.use('/services', servicesRouter);
router.use('/countries', countriesRouter);
router.use('/payment', PaymentRouter);
router.use('/history', historyRouter);
router.use('/transactions', transactionsRouter);
router.use('/activation', activationRouter);

module.exports = router;